import { auth } from "../../../../auth";
import { DailyWords } from "@/components/daily-words";
import { db } from "@/lib/db";
import { getLocalDate } from "@/lib/date";

export default async function DailyVocabularyPage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await db.userLearningProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const date = getLocalDate(profile.timezone);
  const set = await db.dailyVocabularySet.findUnique({
    where: { userId_localDate: { userId, localDate: date } },
    include: { entries: { include: { vocabulary: true }, orderBy: { position: "asc" } } },
  });
  const progress = set
    ? await db.userVocabularyProgress.findMany({
        where: { userId, vocabularyId: { in: set.entries.map((entry) => entry.vocabularyId) } },
        select: { vocabularyId: true, isLearned: true },
      })
    : [];
  const progressByVocabulary = new Map(progress.map((item) => [item.vocabularyId, { isLearned: item.isLearned }]));
  const words = set?.entries.map((entry) => ({
    ...entry.vocabulary,
    progress: progressByVocabulary.get(entry.vocabularyId) ?? null,
  })) ?? [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-[#8a94a6]">Daily practice · {date}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Kosakata hari ini</h1>
        <p className="mt-1.5 text-sm text-[#7c879a]">Sepuluh kata baru dengan arti, pelafalan, dan contoh kalimat.</p>
      </header>
      <DailyWords initialWords={words} />
    </div>
  );
}
