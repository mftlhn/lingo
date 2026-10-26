import { Sparkles } from "lucide-react";
import { auth } from "../../../../auth";
import { Conversation } from "@/components/conversation";
import { db } from "@/lib/db";

export default async function ConversationPage() {
  const session = await auth();
  const existingSession = await db.conversationSession.findFirst({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  const conversationSession = existingSession ?? await db.conversationSession.create({
    data: { userId: session!.user.id },
    select: { id: true },
  });
  const messages = await db.conversationMessage.findMany({
    where: { userId: session!.user.id, sessionId: conversationSession.id },
    orderBy: { createdAt: "asc" },
    take: 40,
    select: { id: true, role: true, content: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f1f0ff] px-3 py-1.5 text-xs font-medium text-[#5956d6]"><Sparkles size={14} /> AI English partner</div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Practice your English</h1>
        <p className="mt-2 text-sm text-[#7c879a]">Ngobrol santai dalam bahasa Inggris. Tutor akan bantu koreksi dengan ramah.</p>
      </header>
      <Conversation sessionId={conversationSession.id} initialMessages={messages.map((message) => ({ ...message, role: message.role === "assistant" ? "assistant" : "user" }))} />
    </div>
  );
}
