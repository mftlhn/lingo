import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db, withDatabaseRetry } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const vocabularyRecords = await db.vocabulary.findMany({
    where: { dailyEntries: { some: { dailySet: { userId: session.user.id } } } },
    select: { id: true, word: true, meaning: true },
  });
  const vocabulary = [...new Map(vocabularyRecords.map((word) => [word.meaning.trim().toLocaleLowerCase("id-ID"), word])).values()];
  if (vocabulary.length < 4) {
    return NextResponse.json({ error: "Kumpulkan setidaknya 4 kata dari Daily Vocabulary sebelum memulai kuis." }, { status: 400 });
  }

  const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, 10).map((answer, position) => {
    const distractors = shuffled
      .filter((candidate) => candidate.id !== answer.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [answer.meaning, ...distractors.map((item) => item.meaning)]
      .sort(() => Math.random() - 0.5);
    return {
      vocabularyId: answer.id,
      prompt: `Apa arti “${answer.word}” dalam bahasa Indonesia?`,
      options,
      optionsJson: JSON.stringify(options),
      position,
    };
  });

  const quiz = await withDatabaseRetry(() => db.$transaction(async (transaction) => {
    const createdQuiz = await transaction.quizSession.create({
      data: { userId: session.user.id, total: questions.length },
    });
    await transaction.quizQuestion.createMany({
      data: questions.map((question) => ({
        vocabularyId: question.vocabularyId,
        prompt: question.prompt,
        optionsJson: question.optionsJson,
        position: question.position,
        quizSessionId: createdQuiz.id,
      })),
    });
    return createdQuiz;
  }));

  const storedQuestions = await db.quizQuestion.findMany({
    where: { quizSessionId: quiz.id },
    orderBy: { position: "asc" },
    select: { id: true, prompt: true, optionsJson: true, position: true },
  });
  return NextResponse.json({
    id: quiz.id,
    total: quiz.total,
    questions: storedQuestions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      options: JSON.parse(question.optionsJson) as string[],
      position: question.position,
    })),
  }, { status: 201 });
}
