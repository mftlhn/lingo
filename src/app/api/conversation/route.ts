import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { generateGeminiContent, getGeminiClient } from "@/lib/gemini";
import { conversationSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }
  const gemini = getGeminiClient();
  if (!gemini) {
    return NextResponse.json(
      { error: "Fitur AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY pada file .env." },
      { status: 503 },
    );
  }
  const parsed = conversationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pesan atau sesi percakapan tidak valid." }, { status: 400 });
  }

  const conversationSession = await db.conversationSession.findFirst({
    where: { id: parsed.data.sessionId, userId: session.user.id },
    select: { id: true },
  });
  if (!conversationSession) {
    return NextResponse.json({ error: "Sesi percakapan tidak ditemukan." }, { status: 404 });
  }

  const history = await db.conversationMessage.findMany({
    where: { userId: session.user.id, sessionId: conversationSession.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  try {
    const completion = await generateGeminiContent({
      contents: [
        ...history.reverse().map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        { role: "user", parts: [{ text: parsed.data.message }] },
      ],
      config: {
        temperature: 0.7,
        systemInstruction:
          "You are a kind English conversation tutor for an Indonesian-speaking learner. Reply primarily in natural English. Keep answers friendly and concise. Gently correct important English mistakes and explain corrections in Indonesian. Ask one follow-up question when it helps the conversation.",
      },
    });
    const reply = completion.text?.trim();
    if (!reply) throw new Error("Gemini returned an empty reply.");
    const [, assistantMessage] = await db.$transaction([
      db.conversationMessage.create({
        data: { userId: session.user.id, sessionId: conversationSession.id, role: "user", content: parsed.data.message },
      }),
      db.conversationMessage.create({
        data: { userId: session.user.id, sessionId: conversationSession.id, role: "assistant", content: reply },
      }),
      db.conversationSession.update({
        where: { id: conversationSession.id },
        data: { updatedAt: new Date() },
      }),
    ]);
    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Conversation reply failed:", error);
    return NextResponse.json(
      { error: "Balasan belum berhasil dibuat. Silakan coba lagi." },
      { status: 502 },
    );
  }
}
