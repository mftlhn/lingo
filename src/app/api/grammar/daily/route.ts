import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { db } from "@/lib/db";
import { getLocalDate } from "@/lib/date";
import { generateGeminiContent, getGeminiClient } from "@/lib/gemini";
import { generatedGrammarSchema } from "@/lib/schemas";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const profile = await db.userLearningProfile.findUnique({
    where: { userId: session.user.id },
    select: { timezone: true, learningLevel: true, placementRequired: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profil belajar tidak ditemukan." }, { status: 404 });
  }
  if (profile.placementRequired) {
    return NextResponse.json({ error: "Selesaikan tes penempatan sebelum memulai pelajaran." }, { status: 403 });
  }

  const localDate = getLocalDate(profile.timezone);
  const existing = await db.grammarDailySet.findUnique({
    where: { userId_localDate: { userId: session.user.id, localDate } },
    include: { questions: { orderBy: { position: "asc" } } },
  });
  if (existing) return NextResponse.json(serializeSet(existing));

  const gemini = getGeminiClient();
  if (!gemini) {
    return NextResponse.json({ error: "Fitur AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY." }, { status: 503 });
  }

  try {
    const recentTopics = await db.grammarDailySet.findMany({
      where: { userId: session.user.id },
      orderBy: { localDate: "desc" },
      take: 20,
      select: { questions: { select: { topic: true } } },
    });
    const excludedTopics = recentTopics.flatMap((set) => set.questions.map((question) => question.topic));
    const response = await generateGeminiContent({
      contents: `Generate exactly 5 distinct English grammar practice questions for a ${profile.learningLevel} learner. Avoid repeating these recent topics where possible: ${excludedTopics.join(", ") || "none"}.`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        systemInstruction:
          "You are an expert English grammar teacher for Indonesian-speaking learners. Create exactly five useful, level-appropriate grammar examples with one multiple-choice practice question each. Return JSON {\"questions\":[...]}. Every question must have topic, rule in simple Indonesian, example in English, translation in Indonesian, prompt, exactly three distinct options, answer exactly matching one option, and explanation in Indonesian. Ensure all five items cover different grammar topics. Do not include markdown.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty grammar response.");
    const parsed = generatedGrammarSchema.safeParse(JSON.parse(text));
    if (!parsed.success) throw new Error("Gemini returned invalid grammar exercises.");
    const generated = parsed.data.questions;
    const topicKeys = generated.map((question) => question.topic.trim().toLocaleLowerCase("en-US"));
    if (new Set(topicKeys).size !== 5) throw new Error("Gemini returned duplicate grammar topics.");
    if (generated.some((question) => new Set(question.options).size !== 3 || !question.options.includes(question.answer))) {
      throw new Error("Gemini returned invalid grammar options.");
    }

    const dailySet = await db.grammarDailySet.create({
      data: {
        userId: session.user.id,
        localDate,
        timezone: profile.timezone,
        level: profile.learningLevel,
        questions: {
          create: generated.map(({ options, ...question }, position) => ({
            ...question,
            optionsJson: JSON.stringify(options),
            position,
          })),
        },
      },
      include: { questions: { orderBy: { position: "asc" } } },
    });
    return NextResponse.json(serializeSet(dailySet), { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const dailySet = await db.grammarDailySet.findUnique({
        where: { userId_localDate: { userId: session.user.id, localDate } },
        include: { questions: { orderBy: { position: "asc" } } },
      });
      if (dailySet) return NextResponse.json(serializeSet(dailySet));
    }
    console.error("Daily grammar generation failed:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json(
      { error: "Latihan grammar hari ini belum berhasil dibuat. Silakan coba lagi." },
      { status: 502 },
    );
  }
}

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function serializeSet<T extends {
  id: string;
  localDate: string;
  level: string;
  questions: Array<{
    id: string;
    position: number;
    topic: string;
    rule: string;
    example: string;
    translation: string;
    prompt: string;
    optionsJson: string;
  }>;
}>(dailySet: T) {
  return {
    id: dailySet.id,
    localDate: dailySet.localDate,
    level: dailySet.level,
    questions: dailySet.questions.map((question) => ({
      id: question.id,
      position: question.position,
      topic: question.topic,
      rule: question.rule,
      example: question.example,
      translation: question.translation,
      prompt: question.prompt,
      options: JSON.parse(question.optionsJson) as string[],
    })),
  };
}
