import { ArrowRight, BookOpenCheck, Flame, Layers3, Target } from "lucide-react";
import Link from "next/link";
import { auth } from "../../../../auth";
import { DailyWords } from "@/components/daily-words";
import { ProgressChart } from "@/components/progress-chart";
import { db } from "@/lib/db";
import { formatDate, getLocalDate, previousLocalDate, shiftLocalDate } from "@/lib/date";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await db.userLearningProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const today = getLocalDate(profile.timezone);
  const [dailySet, learnedCount, dueCount, todayReviews, recentReviews, activeDates, recentQuizzes] = await Promise.all([
    db.dailyVocabularySet.findUnique({
      where: { userId_localDate: { userId, localDate: today } },
      include: {
        entries: {
          orderBy: { position: "asc" },
          include: {
            vocabulary: true,
          },
        },
      },
    }),
    db.userVocabularyProgress.count({ where: { userId, isLearned: true } }),
    db.userVocabularyProgress.count({ where: { userId, nextReviewAt: { lte: new Date() } } }),
    db.vocabularyReview.findMany({
      where: { userId, localDate: today },
      distinct: ["vocabularyId"],
      select: { vocabularyId: true },
    }),
    db.vocabularyReview.findMany({
      where: { userId, localDate: { gte: shiftLocalDate(today, -6), lte: today } },
      select: { localDate: true },
    }),
    db.vocabularyReview.findMany({
      where: { userId },
      distinct: ["localDate"],
      orderBy: { localDate: "desc" },
      take: 400,
      select: { localDate: true },
    }),
    db.quizSession.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 3,
      select: { id: true, score: true, total: true, completedAt: true },
    }),
  ]);

  const todayReviewedIds = new Set(todayReviews.map((item) => item.vocabularyId));
  const todayProgress = dailySet
    ? dailySet.entries.filter((entry) => todayReviewedIds.has(entry.vocabularyId)).length
    : 0;
  const activeDaySet = new Set(activeDates.map((item) => item.localDate));
  let streak = 0;
  let cursor = activeDaySet.has(today) ? today : previousLocalDate(today);
  if (activeDaySet.has(cursor)) {
    while (activeDaySet.has(cursor)) {
      streak += 1;
      cursor = previousLocalDate(cursor);
    }
  }

  const weeklyCount = new Map<string, number>();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = shiftLocalDate(today, -offset);
    weeklyCount.set(day, 0);
  }
  for (const review of recentReviews) weeklyCount.set(review.localDate, (weeklyCount.get(review.localDate) ?? 0) + 1);
  const chartData = [...weeklyCount].map(([date, learned]) => ({
    day: new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00Z`)),
    learned,
  }));

  const metrics = [
    { label: "Hari beruntun", value: streak, icon: Flame, tint: "bg-[#fff0ee] text-[#e07058]" },
    { label: "Kata dipelajari", value: learnedCount, icon: BookOpenCheck, tint: "bg-[#f0efff] text-[#5c58d2]" },
    { label: "Siap direview", value: dueCount, icon: Layers3, tint: "bg-[#fff4e8] text-[#ce7c23]" },
    { label: "Target harian", value: `${todayProgress}/10`, icon: Target, tint: "bg-[#eaf8f1] text-[#39835f]" },
  ];

  const dailyWords = dailySet?.entries.map((entry) => entry.vocabulary) ?? [];
  const dailyProgress = dailyWords.length
    ? await db.userVocabularyProgress.findMany({
        where: { userId, vocabularyId: { in: dailyWords.map((word) => word.id) } },
        select: { vocabularyId: true, isLearned: true },
      })
    : [];
  const progressByVocabulary = new Map(dailyProgress.map((item) => [item.vocabularyId, { isLearned: item.isLearned }]));
  const wordItems = dailyWords.map((word) => ({
    ...word,
    progress: progressByVocabulary.get(word.id) ?? null,
  }));

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm capitalize text-[#8a94a6]">{formatDate(new Date(), profile.timezone)}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-[28px]">Belajar yuk, {session!.user.name?.split(" ")[0]} 👋</h1>
          <p className="mt-1.5 text-sm text-[#7c879a]">Progress hari ini: {todayProgress} dari 10 kata direview.</p>
        </div>
        <Link href="/daily-vocabulary" className="btn border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
          {dailySet ? "Lanjut belajar" : "Mulai belajar"} <ArrowRight size={16} />
        </Link>
      </section>

      {!dailySet && (
        <section className="rounded-2xl border border-[#deddf6] bg-[#f6f5ff] p-5 sm:p-6">
          <h2 className="font-semibold">Selamat datang! Siapkan sesi belajar pertamamu.</h2>
          <p className="mt-1 text-sm leading-6 text-[#707b91]">Buat 10 kata hari ini untuk mulai membangun progres dan streak belajarmu.</p>
          <Link href="/daily-vocabulary" className="btn btn-sm mt-4 border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">Buka kosakata hari ini <ArrowRight size={15} /></Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map(({ label, value, icon: Icon, tint }) => (
          <article key={label} className="soft-card rounded-2xl p-4 sm:p-5">
            <span className={`grid size-9 place-items-center rounded-xl ${tint}`}><Icon size={18} /></span>
            <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-[#8791a4] sm:text-sm">{label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.8fr]">
        <div className="soft-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-start justify-between">
            <div><h2 className="font-semibold">Aktivitas belajarmu</h2><p className="mt-1 text-xs text-[#8993a5]">Kata yang kamu review · 7 hari terakhir</p></div>
            <span className="badge badge-ghost text-xs">7 hari</span>
          </div>
          <div className="mt-4"><ProgressChart data={chartData} /></div>
        </div>
        <section className="soft-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Quiz terbaru</h2><Link href="/practice" className="text-xs font-medium text-[#5956d6]">Latihan <ArrowRight className="inline" size={13} /></Link></div>
          {recentQuizzes.length ? <div className="mt-4 space-y-3">{recentQuizzes.map((quiz) => (
            <div key={quiz.id} className="flex items-center justify-between rounded-xl bg-[#f8f8fd] px-3 py-3">
              <span className="text-sm text-[#657187]">{quiz.completedAt ? formatDate(quiz.completedAt, profile.timezone) : "Practice quiz"}</span>
              <span className="badge border-0 bg-[#eeedff] text-[#5956d6]">{quiz.score}/{quiz.total}</span>
            </div>
          ))}</div> : <p className="mt-4 rounded-xl bg-[#f8f8fd] px-4 py-5 text-sm text-[#7c879a]">Selesaikan kuis pertamamu untuk melihat hasilnya di sini.</p>}
        </section>
      </section>

      <section id="daily-words" className="scroll-mt-24">
        <div className="mb-4 flex items-center justify-between">
          <div><h2 className="text-lg font-semibold">Daily vocabulary</h2><p className="mt-1 text-sm text-[#7c879a]">Pilihan kata untuk memperkaya percakapanmu.</p></div>
          {dailySet && <span className="hidden text-xs text-[#8993a5] sm:block">{dailyWords.length} kata · {today}</span>}
        </div>
        <DailyWords initialWords={wordItems} />
      </section>
    </div>
  );
}
