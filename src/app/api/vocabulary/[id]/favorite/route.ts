import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }
  const { id } = await context.params;
  const entry = await db.dailyVocabularyEntry.findFirst({
    where: { vocabularyId: id, dailySet: { userId: session.user.id } },
    select: { id: true },
  });
  if (!entry) return NextResponse.json({ error: "Kosakata tidak ditemukan." }, { status: 404 });
  const body = z.object({ favorite: z.boolean() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Pilihan favorit tidak valid." }, { status: 400 });

  if (!body.data.favorite) {
    await db.vocabularyFavorite.deleteMany({
      where: { userId: session.user.id, vocabularyId: id },
    });
    return NextResponse.json({ favorite: false });
  }
  await db.$transaction(async (transaction) => {
    await transaction.userVocabularyProgress.upsert({
      where: { userId_vocabularyId: { userId: session.user.id, vocabularyId: id } },
      create: { userId: session.user.id, vocabularyId: id },
      update: {},
    });
    await transaction.vocabularyFavorite.upsert({
      where: { userId_vocabularyId: { userId: session.user.id, vocabularyId: id } },
      create: { userId: session.user.id, vocabularyId: id },
      update: {},
    });
  });
  return NextResponse.json({ favorite: true });
}
