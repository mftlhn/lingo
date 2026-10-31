import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { placementSubmissionSchema } from "@/lib/schemas";
import { getPlacementLevel, placementQuestions } from "@/lib/placement-test";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const parsed = placementSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Jawab semua 15 soal dengan pilihan yang valid." }, { status: 400 });
  }

  const answers = [...parsed.data.answers].sort((a, b) => a.questionIndex - b.questionIndex);
  if (answers.some((answer, index) => answer.questionIndex !== index)) {
    return NextResponse.json({ error: "Setiap soal harus dijawab tepat satu kali." }, { status: 400 });
  }

  const profile = await db.userLearningProfile.findUnique({
    where: { userId: session.user.id },
    select: { placementRequired: true },
  });
  if (!profile?.placementRequired) {
    return NextResponse.json({ error: "Tes penempatan sudah diselesaikan." }, { status: 409 });
  }

  const score = answers.filter(
    (answer) => answer.selectedOption === placementQuestions[answer.questionIndex].answerIndex,
  ).length;
  const level = getPlacementLevel(score);
  const updated = await db.userLearningProfile.updateMany({
    where: { userId: session.user.id, placementRequired: true },
    data: { learningLevel: level, placementRequired: false, placementCompletedAt: new Date() },
  });
  if (updated.count !== 1) {
    return NextResponse.json({ error: "Tes penempatan sudah diselesaikan." }, { status: 409 });
  }

  return NextResponse.json({ score, total: placementQuestions.length, level });
}
