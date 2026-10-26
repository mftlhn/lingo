import { ArrowLeft, BookOpenCheck, CalendarDays, Target } from "lucide-react";
import Link from "next/link";
import { auth } from "../../../../auth";
import { ProgressChart } from "@/components/progress-chart";
import { db } from "@/lib/db";
import { getLocalDate, shiftLocalDate } from "@/lib/date";

export default async function ProgressPage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await db.userLearningProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  const today = getLocalDate(profile.timezone);
  const [learned, total, recentProgress, dailySets, sessionCount] = await Promise.all([
    db.userVocabularyProgress.count({ where: { userId, isLearned: true } }),
    db.vocabulary.count({ where: { dailyEntries: { some: { dailySet: { userId } } } } }),
    db.vocabularyReview.findMany({
      where: { userId, localDate: { gte: shiftLocalDate(today, -6), lte: today } },
      select: { localDate: true },
    }),
    db.dailyVocabularySet.findMany({ where: { userId }, orderBy: { localDate: "desc" }, take: 5, include: { _count: { select: { entries: true } } } }),
    db.dailyVocabularySet.count({ where: { userId } }),
  ]);

  const chartData: { day: string; learned: number }[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const localDate = shiftLocalDate(today, -offset);
    const date = new Date(`${localDate}T12:00:00Z`);
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", month: "short", day: "numeric" }).format(date);
    const learnedToday = recentProgress.filter((item) => item.localDate === localDate).length;
    chartData.push({ day: key, learned: learnedToday });
  }

  return (
    <div className="space-y-7">
      <header><p className="text-sm text-[#8a94a6]">Your journey</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Progress belajar</h1><p className="mt-1.5 text-sm text-[#7c879a]">Lihat perkembanganmu, satu hari pada satu waktu.</p></header>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Kata dipelajari", value: learned, icon: BookOpenCheck, detail: `${total} kata tersimpan` },
          { label: "Kata tersimpan", value: total, icon: Target, detail: "Dari sesi harianmu" },
          { label: "Sesi belajar", value: sessionCount, icon: CalendarDays, detail: "Semua sesi harian" },
        ].map(({ label, value, icon: Icon, detail }) => (
          <article key={label} className="soft-card rounded-2xl p-5"><div className="flex items-center justify-between"><p className="text-sm text-[#7c879a]">{label}</p><Icon size={18} className="text-[#6864dc]" /></div><p className="mt-4 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-[#8a94a6]">{detail}</p></article>
        ))}
      </section>
      <section className="soft-card rounded-2xl p-5 sm:p-7">
        <div><h2 className="font-semibold">Review minggu ini</h2><p className="mt-1 text-sm text-[#8993a5]">Jumlah kata yang kamu review setiap hari.</p></div>
        <div className="mt-5"><ProgressChart data={chartData} /></div>
      </section>
      <section className="soft-card overflow-hidden rounded-2xl">
        <div className="border-b border-[#edf0f5] px-5 py-4 sm:px-6"><h2 className="font-semibold">Sesi belajar terbaru</h2></div>
        {dailySets.length ? dailySets.map((set) => (
          <div key={set.id} className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4 last:border-0 sm:px-6">
            <div><p className="text-sm font-medium">{new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${set.localDate}T12:00:00Z`))}</p><p className="mt-1 text-xs text-[#8a94a6]">Daily vocabulary</p></div>
            <span className="badge badge-ghost">{set._count.entries} kata</span>
          </div>
        )) : <div className="p-8 text-center"><p className="text-sm text-[#7c879a]">Belum ada sesi belajar.</p><Link href="/dashboard" className="btn btn-ghost btn-sm mt-2 text-[#5956d6]">Mulai belajar <ArrowLeft className="rotate-180" size={14} /></Link></div>}
      </section>
    </div>
  );
}
