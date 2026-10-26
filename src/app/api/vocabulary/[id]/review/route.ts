import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { db, withDatabaseRetry } from "@/lib/db";
import { getLocalDate } from "@/lib/date";
import { reviewSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }
  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Jawaban tidak valid." }, { status: 400 });
  }
  const [entry, profile, priorProgress] = await Promise.all([
    db.dailyVocabularyEntry.findFirst({
      where: { vocabularyId: id, dailySet: { userId: session.user.id } },
      select: { vocabularyId: true },
    }),
    db.userLearningProfile.findUnique({
      where: { userId: session.user.id },
      select: { timezone: true },
    }),
    db.userVocabularyProgress.findUnique({
      where: { userId_vocabularyId: { userId: session.user.id, vocabularyId: id } },
    }),
  ]);
  if (!entry) {
    return NextResponse.json({ error: "Kosakata tidak ditemukan." }, { status: 404 });
  }

  const now = new Date();
  const intervalDays = [1, 3, 7, 14, 30];
  const nextReviewAt = parsed.data.remembered
    ? new Date(now.getTime() + intervalDays[Math.min(priorProgress?.reviewCount ?? 0, intervalDays.length - 1)] * 86_400_000)
    : new Date(now.getTime() + 10 * 60_000);
  const timezone = profile?.timezone ?? "Asia/Jakarta";
  const progress = await withDatabaseRetry(() => db.$transaction(async (transaction) => {
    const savedProgress = await transaction.userVocabularyProgress.upsert({
      where: { userId_vocabularyId: { userId: session.user.id, vocabularyId: id } },
      create: {
        userId: session.user.id,
        vocabularyId: id,
        isLearned: parsed.data.remembered,
        reviewCount: parsed.data.remembered ? 1 : 0,
        nextReviewAt,
        lastReviewedAt: now,
        learnedAt: parsed.data.remembered ? now : null,
      },
      update: {
        isLearned: parsed.data.remembered || priorProgress?.isLearned || false,
        reviewCount: parsed.data.remembered ? (priorProgress?.reviewCount ?? 0) + 1 : 0,
        nextReviewAt,
        lastReviewedAt: now,
        learnedAt: parsed.data.remembered ? (priorProgress?.learnedAt ?? now) : priorProgress?.learnedAt,
      },
    });
    await transaction.vocabularyReview.create({
      data: {
        userId: session.user.id,
        vocabularyId: id,
        remembered: parsed.data.remembered,
        localDate: getLocalDate(timezone, now),
      },
    });
    return savedProgress;
  }));
  return NextResponse.json({ progress });
}
