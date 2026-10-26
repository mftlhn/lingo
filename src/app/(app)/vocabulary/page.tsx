import { auth } from "../../../../auth";
import { VocabularyLibrary } from "@/components/vocabulary-library";
import { db } from "@/lib/db";

export default async function VocabularyPage() {
  const session = await auth();
  const vocabulary = await db.vocabulary.findMany({
    where: { dailyEntries: { some: { dailySet: { userId: session!.user.id } } } },
    include: {
      userProgress: { where: { userId: session!.user.id }, select: { isLearned: true } },
      favorites: { where: { userId: session!.user.id }, select: { id: true } },
    },
    orderBy: { word: "asc" },
  });
  return (
    <div className="space-y-6">
      <header><p className="text-sm text-[#8a94a6]">Your collection</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Kosakataku</h1><p className="mt-1.5 text-sm text-[#7c879a]">Semua kata dari sesi belajarmu tersimpan di sini.</p></header>
      <VocabularyLibrary initialWords={vocabulary.map((word) => ({
        ...word,
        isLearned: word.userProgress[0]?.isLearned ?? false,
        isFavorite: word.favorites.length > 0,
      }))} />
    </div>
  );
}
