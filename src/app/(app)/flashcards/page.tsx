import { auth } from "../../../../auth";
import { Flashcards } from "@/components/flashcards";
import { db } from "@/lib/db";

export default async function FlashcardsPage() {
  const session = await auth();
  const entries = await db.dailyVocabularyEntry.findMany({
    where: { dailySet: { userId: session!.user.id } },
    distinct: ["vocabularyId"],
    orderBy: { createdAt: "desc" },
    include: { vocabulary: true },
  });
  return (
    <div className="space-y-7">
      <header><p className="text-sm text-[#8a94a6]">Recall practice</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Flashcards</h1><p className="mt-1.5 text-sm text-[#7c879a]">Uji ingatanmu dengan kartu kosakata bilingual.</p></header>
      <Flashcards words={entries.map((entry) => entry.vocabulary)} />
    </div>
  );
}
