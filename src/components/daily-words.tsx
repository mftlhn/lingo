"use client";

import { Check, LoaderCircle, Sparkles, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Toast } from "@/components/toast";

export type WordItem = {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  progress: { isLearned: boolean } | null;
};

export function DailyWords({ initialWords }: { initialWords: WordItem[] }) {
  const router = useRouter();
  const [words, setWords] = useState(initialWords);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dismissNotice = useCallback(() => setNotice(""), []);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/vocabulary/generate", { method: "POST" });
      const result = (await response.json()) as { error?: string; words?: WordItem[] };
      if (!response.ok) throw new Error(result.error ?? "Kosakata belum berhasil dibuat.");
      setWords((result.words ?? []).map((word) => ({ ...word, progress: word.progress ?? null })));
      setNotice("10 kata baru sudah siap dipelajari.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  async function markLearned(word: WordItem) {
    setError("");
    try {
      const response = await fetch(`/api/vocabulary/${word.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remembered: true }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Progres belum tersimpan.");
      setWords((current) =>
        current.map((item) => item.id === word.id ? { ...item, progress: { isLearned: true } } : item),
      );
      setNotice("Progres belajarmu berhasil disimpan.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    }
  }

  const completed = words.filter((word) => word.progress?.isLearned).length;

  if (words.length === 0) {
    return (
      <section className="soft-card rounded-2xl p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f1f0ff] text-[#5956d6]"><Sparkles size={21} /></div>
        <h2 className="mt-5 text-xl font-semibold">Kata baru, setiap hari</h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-[#7c879a]">
          Siap menambah kosakata hari ini? Tutor AI akan menyiapkan tepat 10 kata baru lengkap dengan arti, panduan pelafalan, dan contoh kalimat.
        </p>
        {error && <div role="alert" className="alert alert-error mt-5 text-sm">{error}</div>}
        <button onClick={generate} disabled={loading} className="btn mt-6 border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
          {loading ? <LoaderCircle className="animate-spin" size={17} /> : <Sparkles size={17} />}
          Buat 10 kata hari ini
        </button>
      </section>
    );
  }

  return (
    <>
    {notice && <Toast key={notice} message={notice} onDismiss={dismissNotice} />}
    <section className="soft-card overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0f5] px-5 py-5 sm:px-7">
        <div><p className="text-sm text-[#8993a5]">Today&apos;s vocabulary</p><h2 className="mt-1 text-lg font-semibold">10 kata untukmu</h2></div>
        <span className="badge border-0 bg-[#f1f0ff] px-3 py-3 text-[#514dc7]">{completed} / 10 dipelajari</span>
      </div>
      <div className="px-5 sm:px-7">
        <progress className="progress h-1.5 w-full text-[#5956d6]" value={completed * 10} max="100" />
        {error && <div role="alert" className="alert alert-error my-4 text-sm">{error}</div>}
        <div className="divide-y divide-[#edf0f5]">
          {words.map((word, index) => (
            <article key={word.id} className="word-row grid gap-4 py-5 sm:grid-cols-[40px_1fr_auto] sm:items-start">
              <span className="grid size-9 place-items-center rounded-xl bg-[#f5f6fa] text-xs font-semibold text-[#8893a7]">{String(index + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-lg font-semibold tracking-tight">{word.word}</h3>
                  <span className="text-sm text-[#8c96a8]">{word.pronunciation}</span>
                  <span className="badge badge-ghost badge-sm text-[#858fa2]">{word.partOfSpeech}</span>
                  <button
                    className="btn btn-ghost btn-circle btn-xs text-[#7772d4]"
                    aria-label={`Dengarkan ${word.word}`}
                    onClick={() => {
                      if ("speechSynthesis" in window) {
                        const utterance = new SpeechSynthesisUtterance(word.word);
                        utterance.lang = "en-US";
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                  ><Volume2 size={15} /></button>
                </div>
                <p className="mt-1 text-sm font-medium text-[#4d596e]">{word.meaning}</p>
                <blockquote className="mt-3 border-l-2 border-[#d9d7ff] pl-3 text-sm leading-6 text-[#5d687d]">
                  {word.example}<span className="mt-0.5 block text-xs text-[#929bad]">{word.exampleTranslation}</span>
                </blockquote>
              </div>
              <button
                onClick={() => markLearned(word)}
                disabled={word.progress?.isLearned}
                className={`btn btn-sm w-full sm:w-auto ${word.progress?.isLearned ? "btn-ghost text-[#39835f]" : "btn-outline border-[#deddf6] text-[#5956d6] hover:bg-[#f1f0ff]"}`}
              >
                {word.progress?.isLearned ? <><Check size={15} /> Dipelajari</> : "Tandai dipelajari"}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
