"use client";

import { CheckCircle2, CircleX, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

type QuizQuestion = { id: string; prompt: string; options: string[]; position: number };
type Quiz = { id: string; total: number; questions: QuizQuestion[] };
type QuizResult = {
  score: number;
  total: number;
  results: Array<{ id: string; correctAnswer: string; selectedAnswer: string; isCorrect: boolean }>;
};

export function QuizRunner() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/quiz", { method: "POST" });
      const data = (await response.json()) as Quiz & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Kuis belum berhasil dimulai.");
      setQuiz(data);
      setAnswers({});
      setResult(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!quiz || Object.keys(answers).length !== quiz.questions.length) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/quiz/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption })) }),
      });
      const data = (await response.json()) as QuizResult & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Jawaban belum berhasil dikirim.");
      setResult(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Terjadi kesalahan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="soft-card rounded-2xl p-5 sm:p-8">
      {error && <div role="alert" className="alert alert-error mb-5 text-sm">{error}</div>}
      {!quiz ? (
        <div className="py-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f1f0ff] text-[#5956d6]"><Sparkles size={24} /></span>
          <h2 className="mt-5 text-lg font-semibold">Quiz kosakata</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7c879a]">Uji pemahamanmu dengan pilihan ganda yang dibuat dari kata-kata yang sudah kamu pelajari.</p>
          <button disabled={busy} onClick={start} className="btn mt-6 border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">{busy && <span className="loading loading-spinner loading-sm" />} Mulai kuis</button>
        </div>
      ) : result ? (
        <div>
          <div className="text-center"><p className="text-sm text-[#8993a5]">Hasil kuis</p><h2 className="mt-2 text-4xl font-semibold text-[#5956d6]">{result.score}<span className="text-xl text-[#8993a5]">/{result.total}</span></h2><p className="mt-2 text-sm text-[#7c879a]">{result.score === result.total ? "Sempurna! Kerja bagus." : "Bagus! Terus berlatih agar makin ingat."}</p></div>
          <div className="mt-7 space-y-3">{quiz.questions.map((question) => {
            const answer = result.results.find((item) => item.id === question.id);
            return <div key={question.id} className="rounded-xl bg-[#f8f8fd] p-4">
              <div className="flex items-start gap-2">{answer?.isCorrect ? <CheckCircle2 className="mt-0.5 text-[#39835f]" size={17} /> : <CircleX className="mt-0.5 text-[#bd665b]" size={17} />}<div className="text-sm"><p className="font-medium">{question.prompt}</p><p className="mt-1 text-[#7c879a]">Jawabanmu: {answer?.selectedAnswer}</p>{!answer?.isCorrect && <p className="mt-1 text-[#39835f]">Jawaban benar: {answer?.correctAnswer}</p>}</div></div>
            </div>;
          })}</div>
          <button onClick={start} disabled={busy} className="btn mt-6 w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]"><RotateCcw size={16} /> Coba kuis lagi</button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between"><h2 className="font-semibold">Pilih arti yang benar</h2><span className="badge badge-ghost">{quiz.questions.length} soal</span></div>
          <div className="mt-5 space-y-5">{quiz.questions.map((question, index) => (
            <fieldset key={question.id} className="rounded-xl border border-[#edf0f5] p-4">
              <legend className="px-1 text-sm font-medium">{index + 1}. {question.prompt}</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">{question.options.map((option) => (
                <label key={option} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${answers[question.id] === option ? "border-[#9591ec] bg-[#f4f3ff] text-[#4e49c5]" : "border-[#edf0f5] hover:bg-[#f8f8fd]"}`}>
                  <input type="radio" name={question.id} className="radio radio-primary radio-sm" checked={answers[question.id] === option} onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} />
                  {option}
                </label>
              ))}</div>
            </fieldset>
          ))}</div>
          <button disabled={busy || Object.keys(answers).length !== quiz.questions.length} onClick={submit} className="btn mt-6 w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">{busy && <span className="loading loading-spinner loading-sm" />} Kirim jawaban</button>
        </div>
      )}
    </section>
  );
}
