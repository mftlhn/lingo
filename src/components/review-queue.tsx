"use client";

import { Check, RotateCcw } from "lucide-react";
import { useState } from "react";

type ReviewWord = {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
};

export function ReviewQueue({ initialWords }: { initialWords: ReviewWord[] }) {
  const [words, setWords] = useState(initialWords);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const current = words[0];

  async function answer(remembered: boolean) {
    if (!current) return;
    setError("");
    setSaving(true);
    try {
      const response = await fetch(`/api/vocabulary/${current.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remembered }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Jawaban belum berhasil disimpan.");
        return;
      }
      if (remembered) setWords((items) => items.slice(1));
      else setWords((items) => [...items.slice(1), current]);
      setRevealed(false);
    } catch {
      setError("Koneksi bermasalah. Jawabanmu belum tersimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (!current) {
    return <div className="soft-card rounded-2xl p-10 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf8f1] text-[#39835f]"><Check size={22} /></div><h2 className="mt-4 text-lg font-semibold">Sesi review selesai!</h2><p className="mt-2 text-sm text-[#7c879a]">Bagus sekali. Progresmu sudah tersimpan.</p></div>;
  }

  return (
    <section className="soft-card rounded-2xl p-6 sm:p-10">
      <div className="flex items-center justify-between text-sm text-[#8a94a6]"><span>{words.length} kata tersisa</span><span className="badge badge-ghost">{current.partOfSpeech}</span></div>
      <div className="my-12 min-h-32 text-center">
        <p className="text-3xl font-semibold tracking-tight sm:text-4xl">{current.word}</p>
        <p className="mt-2 text-sm text-[#8a94a6]">{current.pronunciation}</p>
        {revealed ? (
          <div className="mx-auto mt-8 max-w-xl text-left">
            <p className="text-center text-lg font-medium">{current.meaning}</p>
            <blockquote className="mt-6 rounded-xl bg-[#f8f8fd] p-4 text-sm leading-6 text-[#59657b]">{current.example}<span className="mt-1 block text-xs text-[#8b95a7]">{current.exampleTranslation}</span></blockquote>
          </div>
        ) : <p className="mt-6 text-sm text-[#8993a5]">Ingat arti kata ini?</p>}
      </div>
      {error && <div role="alert" className="alert alert-error mb-4 text-sm">{error}</div>}
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">Lihat arti</button>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button disabled={saving} onClick={() => answer(false)} className="btn btn-outline border-[#f0d5d0] text-[#bd665b] hover:bg-[#fff5f3]"><RotateCcw size={16} /> Belum ingat</button>
          <button disabled={saving} onClick={() => answer(true)} className="btn border-0 bg-[#39835f] text-white hover:bg-[#2e714f]">{saving ? <span className="loading loading-spinner loading-xs" /> : <Check size={16} />} Sudah ingat</button>
        </div>
      )}
    </section>
  );
}
