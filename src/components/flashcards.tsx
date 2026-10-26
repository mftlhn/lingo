"use client";

import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { useState } from "react";

type FlashcardWord = {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
};

export function Flashcards({ words }: { words: FlashcardWord[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");
  const current = words[index];

  function move(direction: number) {
    setIndex((value) => (value + direction + words.length) % words.length);
    setFlipped(false);
  }

  async function markReviewed() {
    if (!current) return;
    setError("");
    try {
      const response = await fetch(`/api/vocabulary/${current.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remembered: true }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Progress belum tersimpan.");
      move(1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    }
  }

  if (!current) return <div className="soft-card rounded-2xl p-10 text-center"><h2 className="font-semibold">Belum ada flashcard</h2><p className="mt-2 text-sm text-[#7c879a]">Buat sesi kosakata harian untuk memulai.</p></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-sm text-[#8993a5]"><span>Kartu {index + 1} dari {words.length}</span><button onClick={() => { setIndex(0); setFlipped(false); }} className="btn btn-ghost btn-sm"><RotateCcw size={15} /> Mulai ulang</button></div>
      <button onClick={() => setFlipped((value) => !value)} aria-label={flipped ? "Tampilkan sisi kata" : "Balik kartu untuk melihat arti"} className="soft-card flex min-h-[320px] w-full flex-col items-center justify-center rounded-3xl p-8 text-center transition hover:border-[#c9c7f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5956d6]">
        {!flipped ? <><p className="text-3xl font-semibold tracking-tight">{current.word}</p><p className="mt-3 text-sm text-[#8993a5]">{current.pronunciation}</p><p className="mt-8 text-sm text-[#5956d6]">Ketuk untuk lihat arti</p></> : <><p className="text-xs uppercase tracking-widest text-[#8993a5]">{current.word}</p><p className="mt-3 text-2xl font-semibold">{current.meaning}</p><p className="mt-6 max-w-lg text-sm leading-6 text-[#59657b]">{current.example}<span className="mt-1 block text-xs text-[#8993a5]">{current.exampleTranslation}</span></p></>}
      </button>
      {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}
      <div className="flex items-center justify-between gap-3">
        <button onClick={() => move(-1)} className="btn btn-outline border-[#e2e4ee]"><ArrowLeft size={16} /> Sebelumnya</button>
        {flipped && <button onClick={markReviewed} className="btn border-0 bg-[#39835f] text-white hover:bg-[#2e714f]">Ingat kata ini</button>}
        <button onClick={() => move(1)} className="btn btn-outline border-[#e2e4ee]">Selanjutnya <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
