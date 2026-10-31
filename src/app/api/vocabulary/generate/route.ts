import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { db, withDatabaseRetry } from "@/lib/db";
import { getLocalDate } from "@/lib/date";
import { generateGeminiContent, getGeminiClient } from "@/lib/gemini";
import { generatedVocabularySchema } from "@/lib/schemas";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }
  const gemini = getGeminiClient();
  if (!gemini) {
    return NextResponse.json(
      { error: "Fitur AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY pada file .env." },
      { status: 503 },
    );
  }

  const profile = await db.userLearningProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });
  const date = getLocalDate(profile.timezone);
  const existing = await db.dailyVocabularySet.findUnique({
    where: { userId_localDate: { userId: session.user.id, localDate: date } },
    include: { entries: { include: { vocabulary: true }, orderBy: { position: "asc" } } },
  });
  if (existing) return NextResponse.json(await serializeDailySet(existing, session.user.id));

  const previousWords = await db.vocabulary.findMany({
    where: { dailyEntries: { some: { dailySet: { userId: session.user.id } } } },
    select: { word: true },
  });
  const previousWordSet = new Set(previousWords.map((item) => normalizeTerm(item.word)));
  try {
    const completion = await generateGeminiContent({
      contents: `Create today's fresh vocabulary. Excluded words: ${previousWords.map((item) => item.word).join(", ") || "none"}`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        systemInstruction:
          "You are an English teacher for Indonesian-speaking learners. Generate exactly 10 useful, distinct English vocabulary words appropriate for an intermediate learner. Return only a JSON object with a `words` array. Each item must have `word`, `meaning` (natural Indonesian meaning), `pronunciation` (simple IPA), `partOfSpeech`, `example` (natural English sentence), and `exampleTranslation` (natural Indonesian translation). Do not include any word from the excluded list.",
      },
    });
    const content = completion.text;
    if (!content) throw new Error("Gemini returned an empty response.");
    const generated = generatedVocabularySchema.safeParse(JSON.parse(content));
    if (!generated.success) {
      throw new Error("Gemini did not return exactly 10 valid vocabulary items.");
    }
    const normalizedWords = generated.data.words.map((item) => ({
      ...item,
      word: item.word.trim(),
    }));
    if (new Set(normalizedWords.map((item) => normalizeTerm(item.word))).size !== 10) {
      throw new Error("Gemini returned duplicate words.");
    }
    if (normalizedWords.some((item) => previousWordSet.has(normalizeTerm(item.word)))) {
      throw new Error("Gemini returned words already learned by this user.");
    }

    const dailySetId = await withDatabaseRetry(() => db.$transaction(async (transaction) => {
      const dailySet = await transaction.dailyVocabularySet.create({
        data: { userId: session.user.id, localDate: date, timezone: profile.timezone },
      });
      const vocabularyIds: string[] = [];
      for (const item of normalizedWords) {
        const vocabulary = await transaction.vocabulary.upsert({
          where: { term: normalizeTerm(item.word) },
          create: {
            term: normalizeTerm(item.word),
            word: item.word,
            meaning: item.meaning,
            pronunciation: item.pronunciation,
            partOfSpeech: item.partOfSpeech,
            example: item.example,
            exampleTranslation: item.exampleTranslation,
          },
          update: {},
          select: { id: true },
        });
        vocabularyIds.push(vocabulary.id);
      }
      await transaction.dailyVocabularyEntry.createMany({
        data: vocabularyIds.map((vocabularyId, position) => ({
          dailySetId: dailySet.id,
          vocabularyId,
          position,
        })),
      });
      return dailySet.id;
    }));
    const dailySet = await db.dailyVocabularySet.findUniqueOrThrow({
      where: { id: dailySetId },
      include: { entries: { include: { vocabulary: true }, orderBy: { position: "asc" } } },
    });
    return NextResponse.json(await serializeDailySet(dailySet, session.user.id), { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const dailySet = await db.dailyVocabularySet.findUnique({
        where: { userId_localDate: { userId: session.user.id, localDate: date } },
        include: { entries: { include: { vocabulary: true }, orderBy: { position: "asc" } } },
      });
      if (dailySet) return NextResponse.json(await serializeDailySet(dailySet, session.user.id));
    }
    console.error("Daily vocabulary generation failed:", error);
    return NextResponse.json(
      { error: "Kata hari ini belum berhasil dibuat. Silakan coba lagi sebentar." },
      { status: 502 },
    );
  }
}

function normalizeTerm(word: string) {
  return word.trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

async function serializeDailySet(
  dailySet: {
    id: string;
    localDate: string;
    entries: Array<{
      id: string;
      position: number;
      vocabulary: {
        id: string;
        word: string;
        meaning: string;
        pronunciation: string;
        partOfSpeech: string;
        example: string;
        exampleTranslation: string;
      };
    }>;
  },
  userId: string,
) {
  const progress = await db.userVocabularyProgress.findMany({
    where: {
      userId,
      vocabularyId: { in: dailySet.entries.map((entry) => entry.vocabulary.id) },
    },
    select: { vocabularyId: true, isLearned: true },
  });
  const progressByVocabulary = new Map(progress.map((item) => [item.vocabularyId, item]));
  return {
    id: dailySet.id,
    date: dailySet.localDate,
    words: dailySet.entries.map((entry) => ({
      ...entry.vocabulary,
      progress: progressByVocabulary.get(entry.vocabulary.id) ?? null,
    })),
  };
}
