import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
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
    const errorCode = getPrismaErrorCode(error);
    if (errorCode === "P2002") {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan masuk." },
        { status: 409 },
      );
    }
    console.error("Registration failed:", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorCode: errorCode ?? "UNKNOWN",
    });
    return NextResponse.json(
      { error: getRegistrationErrorMessage(errorCode) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

function getPrismaErrorCode(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  if (error instanceof Prisma.PrismaClientInitializationError) return error.errorCode ?? null;
  return null;
}

function getRegistrationErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case "P1000":
    case "P1010":
      return "Database Supabase menolak koneksi. Periksa kredensial database di Environment Variables Vercel.";
    case "P1001":
    case "P1002":
      return "Server tidak dapat terhubung ke database Supabase. Periksa URL koneksi dan status database.";
    case "P1003":
      return "Database tidak ditemukan. Periksa nama database pada URL koneksi Supabase.";
    case "P1011":
      return "Koneksi aman ke database gagal. Periksa pengaturan SSL pada URL koneksi Supabase.";
    case "P2021":
    case "P2022":
      return "Tabel database belum tersedia atau belum sesuai. Jalankan migrasi Prisma PostgreSQL, lalu deploy ulang.";
    default:
      return "Pendaftaran gagal karena masalah konfigurasi server. Periksa log Function untuk /api/auth/register di Vercel.";
  }
}
