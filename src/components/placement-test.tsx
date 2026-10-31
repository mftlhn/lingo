"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";

type Question = { prompt: string; options: string[] };
type PlacementResult = { score: number; total: number; level: string };

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export function PlacementTest({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const answeredCount = Object.keys(answers).length;

  async function submitTest() {
    if (answeredCount !== questions.length) {
      setError("Jawab semua pertanyaan sebelum menyelesaikan tes.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((_, questionIndex) => ({
            questionIndex,
            selectedOption: answers[questionIndex],
          })),
        }),
      });
      const submitted = await response.json().catch(() => null) as (PlacementResult & { error?: string }) | null;
      if (!response.ok) {
        setError(submitted?.error ?? "Tes belum berhasil disimpan. Coba lagi.");
        return;
      }
      if (!submitted?.level) {
        setError("Hasil tes belum berhasil dimuat. Coba lagi.");
        return;
      }
      setResult(submitted);
    } catch {
      setError("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="soft-card rounded-2xl p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-xl bg-[#f1f0ff] text-[#5956d6]"><GraduationCap size={22} /></span>
          <p className="mt-5 text-sm font-medium text-[#5956d6]">Tes penempatan awal · 15 soal</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Kenali level bahasa Inggrismu</h1>
          <p className="mt-2 text-sm leading-6 text-[#7c879a]">
            Jawab tanpa bantuan untuk mendapatkan rekomendasi level Beginner, Intermediate, atau Advanced. Soal disusun sebagai latihan grammar bergaya IELTS/TOEFL, bukan tes resmi.
          </p>
          {result && (
            <div role="status" className="alert alert-success mt-5">
              <GraduationCap size={20} />
              <span>
                <strong>Level kamu: {levelLabels[result.level] ?? result.level}</strong>
                <span className="block text-sm">Skor {result.score} dari {result.total}. Materi grammar harianmu akan disesuaikan dengan level ini.</span>
              </span>
            </div>
          )}
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eceef4]">
            <div className="h-full rounded-full bg-[#5956d6] transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#8993a5]">{answeredCount} dari {questions.length} dijawab</p>
        </header>

        {!result && questions.map((question, questionIndex) => (
          <section key={questionIndex} className="soft-card rounded-2xl p-5 sm:p-6">
            <h2 className="text-sm font-semibold"><span className="mr-2 text-[#5956d6]">{String(questionIndex + 1).padStart(2, "0")}.</span>{question.prompt}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAnswers((previous) => ({ ...previous, [questionIndex]: optionIndex }))}
                    className={`min-h-11 rounded-xl border px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5956d6] ${
                      selected ? "border-[#aaa6ff] bg-[#f4f3ff] text-[#514dc7]" : "border-[#e9edf4] bg-white hover:border-[#c9c6ff]"
                    }`}
                  >
                    <span className="mr-2 text-xs text-[#8993a5]">{String.fromCharCode(65 + optionIndex)}.</span>{option}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {error && <p role="alert" className="alert alert-error text-sm">{error}</p>}
        {result ? (
          <button type="button" onClick={() => { router.replace("/dashboard"); router.refresh(); }} className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
            Lanjut ke dashboard
          </button>
        ) : (
          <button type="button" onClick={submitTest} disabled={busy} className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
            {busy && <span className="loading loading-spinner loading-sm" />}
            Selesaikan tes dan lihat level
          </button>
        )}
      </div>
    </main>
  );
}
