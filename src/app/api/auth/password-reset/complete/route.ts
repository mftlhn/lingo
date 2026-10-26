import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db, withDatabaseRetry } from "@/lib/db";
import { passwordResetSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = passwordResetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true, consumedAt: true },
  });
  if (!resetToken || resetToken.consumedAt || resetToken.expiresAt <= new Date()) {
    return NextResponse.json({ error: "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru." }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const now = new Date();
  const changed = await withDatabaseRetry(() => db.$transaction(async (transaction) => {
    const claimed = await transaction.passwordResetToken.updateMany({
      where: {
        id: resetToken.id,
        userId: resetToken.userId,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      data: { consumedAt: now },
    });
    if (claimed.count !== 1) return false;
    await transaction.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });
    await transaction.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId, id: { not: resetToken.id } },
    });
    return true;
  }));
  if (!changed) {
    return NextResponse.json({ error: "Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
