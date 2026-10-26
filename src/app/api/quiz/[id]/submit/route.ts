import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { db, withDatabaseRetry } from "@/lib/db";
import { quizSubmissionSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }
  const { id } = await context.params;
  const parsed = quizSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Jawab semua pertanyaan dengan pilihan yang valid." }, { status: 400 });
  }

  const quiz = await db.quizSession.findFirst({
    where: { id, userId: session.user.id, status: "in_progress" },
    include: { questions: { include: { correctVocabulary: true }, orderBy: { position: "asc" } } },
  });
  if (!quiz) return NextResponse.json({ error: "Kuis tidak ditemukan atau sudah diselesaikan." }, { status: 404 });
  if (parsed.data.answers.length !== quiz.questions.length) {
    return NextResponse.json({ error: "Jawab semua pertanyaan sebelum mengirim kuis." }, { status: 400 });
  }

  const submitted = new Map(parsed.data.answers.map((answer) => [answer.questionId, answer.selectedOption]));
  if (submitted.size !== quiz.questions.length) {
    return NextResponse.json({ error: "Setiap pertanyaan hanya dapat dijawab satu kali." }, { status: 400 });
  }
  const preparedAnswers = quiz.questions.map((question) => {
    const selectedTerm = submitted.get(question.id);
    const options = JSON.parse(question.optionsJson) as string[];
    if (!selectedTerm || !options.includes(selectedTerm)) return null;
    return {
      quizSessionId: quiz.id,
      questionId: question.id,
      selectedTerm,
      isCorrect: selectedTerm === question.correctVocabulary.meaning,
    };
  });
  if (preparedAnswers.some((answer) => answer === null)) {
    return NextResponse.json({ error: "Ada pilihan jawaban yang tidak valid." }, { status: 400 });
  }
  const answers = preparedAnswers.filter((answer) => answer !== null);
  const score = answers.filter((answer) => answer.isCorrect).length;
  try {
    await withDatabaseRetry(() => db.$transaction(async (transaction) => {
      const claimed = await transaction.quizSession.updateMany({
        where: { id: quiz.id, userId: session.user.id, status: "in_progress" },
        data: { status: "completed", score, completedAt: new Date() },
      });
      if (claimed.count !== 1) throw new Error("Quiz has already been completed.");
      await transaction.quizAnswer.createMany({ data: answers });
    }));
  } catch (error) {
    if (error instanceof Error && error.message === "Quiz has already been completed.") {
      return NextResponse.json({ error: "Kuis ini sudah dikirim." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({
    score,
    total: quiz.questions.length,
    results: quiz.questions.map((question) => ({
      id: question.id,
      correctAnswer: question.correctVocabulary.meaning,
      selectedAnswer: submitted.get(question.id),
      isCorrect: submitted.get(question.id) === question.correctVocabulary.meaning,
    })),
  });
}
