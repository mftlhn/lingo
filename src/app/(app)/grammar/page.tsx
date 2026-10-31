import { auth } from "../../../../auth";
import { GrammarLessons } from "@/components/grammar-lessons";
import { db } from "@/lib/db";
import { getLocalDate } from "@/lib/date";

export default async function GrammarPage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await db.userLearningProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const today = getLocalDate(profile.timezone);
  const sets = await db.grammarDailySet.findMany({
    where: { userId },
    orderBy: { localDate: "desc" },
    include: {
      questions: { orderBy: { position: "asc" } },
      attempts: {
        orderBy: { completedAt: "desc" },
        include: {
          answers: {
            include: { question: { select: { answer: true, explanation: true } } },
          },
        },
      },
    },
  });

  const currentSet = sets.find((set) => set.localDate === today) ?? null;
  const toClientSet = (set: (typeof sets)[number]) => ({
    id: set.id,
    localDate: set.localDate,
    level: set.level,
    questions: set.questions.map((question) => ({
      id: question.id,
      position: question.position,
      topic: question.topic,
      rule: question.rule,
      example: question.example,
      translation: question.translation,
      prompt: question.prompt,
      options: JSON.parse(question.optionsJson) as string[],
    })),
    attempts: set.attempts.map((attempt) => ({
      id: attempt.id,
      score: attempt.score,
      total: attempt.total,
      completedAt: attempt.completedAt.toISOString(),
      answers: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect: answer.isCorrect,
        correctAnswer: answer.question.answer,
        explanation: answer.question.explanation,
      })),
    })),
  });

  return (
    <GrammarLessons
      level={profile.learningLevel}
      today={today}
      initialSet={currentSet ? toClientSet(currentSet) : null}
      history={sets.map(toClientSet)}
    />
  );
}
