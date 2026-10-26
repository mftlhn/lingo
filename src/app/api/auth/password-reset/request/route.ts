import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { passwordResetRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const parsed = passwordResetRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Alamat email tidak valid." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !process.env.APP_URL) {
    return NextResponse.json(
      { error: "Reset kata sandi belum tersedia karena pengiriman email belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json({ ok: true });

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    db.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    }),
  ]);

  const resetUrl = new URL("/reset-password", process.env.APP_URL);
  resetUrl.hash = new URLSearchParams({ token }).toString();
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [user.email],
        subject: "Reset kata sandi Lingo",
        text: `Gunakan tautan ini untuk membuat kata sandi baru. Tautan berlaku selama satu jam:\n\n${resetUrl.toString()}\n\nJika kamu tidak meminta reset, abaikan email ini.`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Email provider rejected the message.");
  } catch {
    await db.passwordResetToken.deleteMany({ where: { tokenHash } });
    console.error("Password reset email delivery failed.");
    return NextResponse.json({ error: "Email reset belum dapat dikirim. Coba lagi nanti." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
