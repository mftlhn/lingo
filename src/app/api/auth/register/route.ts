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
        learningProfile: { create: { timezone: "Asia/Jakarta", placementRequired: true } },
      },
    });
  } catch (error) {
    const errorCode = getPrismaErrorCode(error);

    // Kode P2002 berlaku baik di SQLite maupun PostgreSQL untuk Constraint Unique (Email)
    if (errorCode === "P2002") {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan masuk." },
        { status: 409 },
      );
    }

    console.error("Registration failed:", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorCode: errorCode ?? "UNKNOWN",
      errorMessage: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: getRegistrationErrorMessage(errorCode, error) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

function getPrismaErrorCode(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code;
  if (error instanceof Prisma.PrismaClientInitializationError) return error.errorCode ?? null;
  return null;
}

function getRegistrationErrorMessage(errorCode: string | null, error: unknown): string {
  const isDev = process.env.NODE_ENV === "development";

  // Penanganan error khusus SQLite di lokal
  if (error instanceof Error && /unable to open the database file/i.test(error.message)) {
    return isDev
      ? "File database SQLite tidak ditemukan. Pastikan Anda telah menjalankan `npx prisma db push` di lokal."
      : "Server masih menggunakan konfigurasi SQLite yang tidak didukung di Vercel. Silakan deploy dengan konfigurasi Supabase PostgreSQL.";
  }

  // Penanganan error kustom berdasarkan ketersediaan lingkungan
  switch (errorCode) {
    case "P1000":
    case "P1010":
      return "Database menolak koneksi. Periksa kredensial database di `.env` (lokal) atau Environment Variables Vercel.";
    case "P1001":
    case "P1002":
      return "Server tidak dapat terhubung ke database. Periksa status server database atau koneksi internet Anda.";
    case "P1003":
      return "Database tidak ditemukan. Periksa nama database pada URL koneksi Anda.";
    case "P1011":
      return "Koneksi aman ke database gagal. Periksa pengaturan SSL pada URL koneksi.";
    case "P2021":
    case "P2022":
      return "Tabel database belum migrasi. Jalankan `npx prisma db push` atau migrasi database terlebih dahulu.";
    default:
      return "Pendaftaran gagal karena masalah server. Silakan coba beberapa saat lagi.";
  }
}