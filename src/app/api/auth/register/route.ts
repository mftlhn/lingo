import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  try {
    const passwordHash = await hash(parsed.data.password, 12);
    await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        passwordHash,
        learningProfile: { create: { timezone: "Asia/Jakarta" } },
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan masuk." },
        { status: 409 },
      );
    }
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Pendaftaran gagal karena ada masalah pada server. Silakan coba lagi nanti." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
