import { Clock3, Sparkles } from "lucide-react";
import { auth } from "../../../../auth";
import { ReviewQueue } from "@/components/review-queue";
import { db } from "@/lib/db";

export default async function ReviewPage() {
  const session = await auth();
  const dueWords = await db.userVocabularyProgress.findMany({
    where: { userId: session!.user.id, nextReviewAt: { lte: new Date() } },
    include: { vocabulary: true },
    orderBy: { nextReviewAt: "asc" },
  });
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#fff4e8] px-3 py-1.5 text-xs font-medium text-[#c57925]"><Clock3 size={14} /> Smart review</div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Waktunya mengingat kembali</h1>
        <p className="mt-2 text-sm text-[#7c879a]">Ulangi kata-kata di waktu yang tepat agar lebih melekat dalam ingatan.</p>
      </header>
      {dueWords.length ? <ReviewQueue initialWords={dueWords.map((item) => item.vocabulary)} /> : (
        <div className="soft-card rounded-2xl p-10 text-center sm:p-14">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f1f0ff] text-[#5956d6]"><Sparkles size={23} /></span>
          <h2 className="mt-5 text-lg font-semibold">Kamu sudah up to date!</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7c879a]">Belum ada kata yang perlu direview. Pelajari kata hari ini dan kami akan mengingatkanmu saat waktunya tiba.</p>
        </div>
      )}
    </div>
  );
}
