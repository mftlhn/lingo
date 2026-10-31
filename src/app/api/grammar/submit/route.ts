import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { db, withDatabaseRetry } from "@/lib/db";
import { grammarAttemptSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const parsed = grammarAttemptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Jawab semua lima soal dengan pilihan yang valid." }, { status: 400 });
  }

  const dailySet = await db.grammarDailySet.findFirst({
    where: { id: parsed.data.dailySetId, userId: session.user.id },
    include: { questions: { orderBy: { position: "asc" } } },
  });
  if (!dailySet || dailySet.questions.length !== 5) {
    return NextResponse.json({ error: "Set latihan grammar tidak ditemukan." }, { status: 404 });
  }

  const submittedAnswers = new Map(parsed.data.answers.map((answer) => [answer.questionId, answer.selectedOption]));
  if (submittedAnswers.size !== dailySet.questions.length) {
    return NextResponse.json({ error: "Setiap soal hanya dapat dijawab satu kali." }, { status: 400 });
  }
  const answers = dailySet.questions.map((question) => {
    const selectedOption = submittedAnswers.get(question.id);
    const options = JSON.parse(question.optionsJson) as string[];
    if (!selectedOption || !options.includes(selectedOption)) return null;
    return {
      questionId: question.id,
      selectedOption,
      isCorrect: selectedOption === question.answer,
    };
  });
  if (answers.some((answer) => answer === null)) {
    return NextResponse.json({ error: "Ada pilihan jawaban yang tidak valid." }, { status: 400 });
  }

  const validAnswers = answers.filter((answer) => answer !== null);
  const score = validAnswers.filter((answer) => answer.isCorrect).length;
  const attempt = await withDatabaseRetry(() => db.grammarAttempt.create({
    data: {
      userId: session.user.id,
      dailySetId: dailySet.id,
      score,
      total: dailySet.questions.length,
      answers: { create: validAnswers },
    },
  }));

  return NextResponse.json({
    id: attempt.id,
    score,
    total: dailySet.questions.length,
    results: dailySet.questions.map((question) => ({
      questionId: question.id,
      selectedOption: submittedAnswers.get(question.id),
      correctAnswer: question.answer,
      isCorrect: submittedAnswers.get(question.id) === question.answer,
      explanation: question.explanation,
    })),
  });
}
