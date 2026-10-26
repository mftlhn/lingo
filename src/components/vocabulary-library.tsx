"use client";

import { Search, Star } from "lucide-react";
import { useState } from "react";

type LibraryWord = {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  exampleTranslation: string;
  isLearned: boolean;
  isFavorite: boolean;
};

export function VocabularyLibrary({ initialWords }: { initialWords: LibraryWord[] }) {
  const [words, setWords] = useState(initialWords);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const filtered = words.filter((word) =>
    `${word.word} ${word.meaning}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );

  async function toggleFavorite(word: LibraryWord) {
    setSaving(word.id);
    setError("");
    try {
      const response = await fetch(`/api/vocabulary/${word.id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: !word.isFavorite }),
      });
      const result = (await response.json()) as { error?: string; favorite?: boolean };
      if (!response.ok) throw new Error(result.error ?? "Favorit belum berhasil disimpan.");
      setWords((current) => current.map((item) =>
        item.id === word.id ? { ...item, isFavorite: result.favorite ?? !item.isFavorite } : item,
      ));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    } finally {
      setSaving("");
    }
  }

  return (
    <section className="soft-card overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-4 border-b border-[#edf0f5] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="text-lg font-semibold">{words.length} kata</p><p className="mt-1 text-sm text-[#8993a5]">Tersimpan dari sesi harianmu</p></div>
        <label className="input input-bordered flex w-full items-center gap-2 bg-white sm:max-w-xs">
          <Search size={17} className="text-[#8a94a6]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari kosakata" placeholder="Cari kata atau arti..." />
        </label>
      </div>
      {error && <div role="alert" className="alert alert-error m-5 text-sm">{error}</div>}
      {filtered.length ? (
        <div className="divide-y divide-[#edf0f5] px-5 sm:px-6">
          {filtered.map((word) => (
            <article key={word.id} className="flex items-start gap-3 py-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{word.word}</h2><span className="text-xs text-[#8a94a6]">{word.pronunciation}</span><span className="badge badge-ghost badge-sm">{word.partOfSpeech}</span></div>
                <p className="mt-1 text-sm text-[#59657b]">{word.meaning}</p>
                <p className="mt-2 text-xs leading-5 text-[#7c879a]">{word.example}<span className="block text-[#98a1b0]">{word.exampleTranslation}</span></p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button disabled={saving === word.id} onClick={() => toggleFavorite(word)} aria-label={word.isFavorite ? `Hapus ${word.word} dari favorit` : `Favoritkan ${word.word}`} className={`btn btn-ghost btn-square btn-sm ${word.isFavorite ? "text-amber-500" : "text-[#a0a8b6]"}`}><Star size={17} fill={word.isFavorite ? "currentColor" : "none"} /></button>
                <span className={`badge badge-sm ${word.isLearned ? "badge-success" : "badge-ghost"}`}>{word.isLearned ? "Dipelajari" : "Baru"}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center"><p className="font-medium">{words.length ? "Kata tidak ditemukan" : "Kosakatamu belum ada"}</p><p className="mt-2 text-sm text-[#7c879a]">{words.length ? "Coba kata pencarian lain." : "Mulai dari 10 kosakata harian pertamamu."}</p></div>
      )}
    </section>
  );
}
