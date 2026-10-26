import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/schemas";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Pengaturan tidak valid." }, { status: 400 });
  }

  const [user, profile] = await db.$transaction([
    db.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { name: true },
    }),
    db.userLearningProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, timezone: parsed.data.timezone },
      update: { timezone: parsed.data.timezone },
      select: { timezone: true },
    }),
  ]);
  return NextResponse.json({ name: user.name, timezone: profile.timezone });
}
