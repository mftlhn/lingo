"use client";

import { useState } from "react";
import { BookOpenText, Check, ChevronDown, ChevronUp, Clock3, GraduationCap, RotateCw } from "lucide-react";

type GrammarQuestion = {
  id: string;
  position: number;
  topic: string;
  rule: string;
  example: string;
  translation: string;
  prompt: string;
  options: string[];
};

type GrammarAnswer = {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
};

type GrammarAttempt = {
  id: string;
  score: number;
  total: number;
  completedAt: string;
  answers: GrammarAnswer[];
};

type GrammarSet = {
  id: string;
  localDate: string;
  level: string;
  questions: GrammarQuestion[];
  attempts: GrammarAttempt[];
};

type Feedback = {
  questionId: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function GrammarLessons({
  level,
  today,
  initialSet,
  history,
}: {
  level: string;
  today: string;
  initialSet: GrammarSet | null;
  history: GrammarSet[];
}) {
  const [dailySet, setDailySet] = useState(initialSet);
  const [setsHistory, setSetsHistory] = useState(history);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback[] | null>(
    initialSet?.attempts[0]?.answers.map((answer) => ({
      ...answer,
      correctAnswer: answer.correctAnswer ?? "",
      explanation: answer.explanation ?? "",
    })) ?? null,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [openHistory, setOpenHistory] = useState<string | null>(null);
  const latestAttempt = dailySet?.attempts[0] ?? null;
  const answeredCount = Object.keys(selectedAnswers).length;

  async function generateDailySet() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/grammar/daily", { method: "POST" });
      const result = await response.json().catch(() => null) as (Omit<GrammarSet, "attempts"> & { error?: string }) | null;
      if (!response.ok || !result) {
        setError(result?.error ?? "Latihan hari ini belum berhasil dimuat.");
        return;
      }
      const generatedSet = { ...result, attempts: [] };
      setDailySet(generatedSet);
      setSetsHistory((previous) => [generatedSet, ...previous.filter((set) => set.id !== generatedSet.id)]);
    } catch {
      setError("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAttempt() {
    if (!dailySet || answeredCount !== dailySet.questions.length) {
      setError("Jawab semua lima soal sebelum mengirim latihan.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/grammar/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailySetId: dailySet.id,
          answers: dailySet.questions.map((question) => ({
            questionId: question.id,
            selectedOption: selectedAnswers[question.id],
          })),
        }),
      });
      const result = await response.json().catch(() => null) as {
        error?: string;
        id?: string;
        score?: number;
        total?: number;
        results?: Feedback[];
      } | null;
      if (!response.ok || !result?.id || !result.results) {
        setError(result?.error ?? "Jawaban belum berhasil disimpan.");
        return;
      }
      setFeedback(result.results);
      const submittedAttempt = {
        id: result.id!,
        score: result.score!,
        total: result.total!,
        completedAt: new Date().toISOString(),
        answers: result.results.map((answer) => ({
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect: answer.isCorrect,
          correctAnswer: answer.correctAnswer,
          explanation: answer.explanation,
        })),
      };
      setDailySet((previous) => previous ? {
        ...previous,
        attempts: [submittedAttempt, ...previous.attempts],
      } : previous);
      setSetsHistory((previous) => previous.map((set) => set.id === dailySet.id
        ? { ...set, attempts: [submittedAttempt, ...set.attempts] }
        : set));
      setSelectedAnswers({});
    } catch {
      setError("Koneksi bermasalah. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <p className="flex items-center gap-2 text-sm font-medium text-[#5956d6]"><BookOpenText size={16} /> Latihan harian</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Grammar lessons</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#7c879a]">
          Lima contoh grammar baru setiap hari, disesuaikan dengan level belajarmu. Semua latihan dan hasil sebelumnya tersimpan di riwayat.
        </p>
      </header>

      <section className="soft-card flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-[#f1f0ff] text-[#5956d6]"><GraduationCap size={21} /></span>
          <div>
            <p className="text-xs text-[#8993a5]">Level belajarmu</p>
            <p className="mt-0.5 font-semibold">{levelLabels[level] ?? level}</p>
          </div>
        </div>
        <span className="badge border-0 bg-[#f7f8fc] px-3 py-3 text-[#69758b]">{formatDate(today)}</span>
      </section>

      {!dailySet ? (
        <section className="soft-card rounded-2xl px-6 py-10 text-center sm:px-10">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f1f0ff] text-[#5956d6]"><BookOpenText size={22} /></span>
          <h2 className="mt-4 text-lg font-semibold">Latihan grammar hari ini siap dibuat</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7c879a]">Gemini akan menyiapkan lima contoh dan latihan baru sesuai levelmu.</p>
          <button type="button" onClick={generateDailySet} disabled={busy} className="btn mt-5 border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
            {busy && <span className="loading loading-spinner loading-sm" />}
            Buat 5 latihan hari ini
          </button>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Latihan hari ini</h2>
              <p className="mt-1 text-sm text-[#7c879a]">Lima topik grammar · {levelLabels[dailySet.level] ?? dailySet.level}</p>
            </div>
            <span className="badge border-0 bg-[#f1f0ff] px-3 py-3 text-[#514dc7]">
              {latestAttempt ? `${latestAttempt.score}/${latestAttempt.total} benar · ${dailySet.attempts.length} percobaan` : `${answeredCount}/${dailySet.questions.length} dijawab`}
            </span>
          </div>

          {dailySet.questions.map((question, index) => {
            const result = feedback?.find((answer) => answer.questionId === question.id);
            const selected = result?.selectedOption ?? selectedAnswers[question.id];
            return (
              <article key={question.id} className="soft-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f1f0ff] text-sm font-semibold text-[#5956d6]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{question.topic}</h3>
                      <span className="badge badge-sm border-0 bg-[#f7f8fc] text-[#69758b]">Grammar</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#69758b]">{question.rule}</p>
                    <div className="mt-3 rounded-xl bg-[#f8f8fd] p-4">
                      <p className="text-sm font-medium text-[#303b50]">{question.example}</p>
                      <p className="mt-1 text-xs text-[#8993a5]">{question.translation}</p>
                    </div>
                    <p className="mt-4 text-sm font-medium">{question.prompt}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {question.options.map((option) => {
                        const chosen = selected === option;
                        const isCorrectOption = result?.correctAnswer === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={Boolean(feedback)}
                            onClick={() => setSelectedAnswers((previous) => ({ ...previous, [question.id]: option }))}
                            aria-pressed={chosen}
                            className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5956d6] ${
                              isCorrectOption
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : chosen && result
                                  ? "border-amber-300 bg-amber-50 text-amber-800"
                                  : chosen
                                    ? "border-[#aaa6ff] bg-[#f4f3ff] text-[#514dc7]"
                                    : "border-[#e9edf4] bg-white hover:border-[#c9c6ff]"
                            }`}
                          >
                            {option}
                            {isCorrectOption && <Check size={16} />}
                          </button>
                        );
                      })}
                    </div>
                    {result && (
                      <p role="status" className={`mt-3 text-sm ${result.isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                        {result.isCorrect ? "Benar! " : `Jawaban yang benar: ${result.correctAnswer}. `}
                        {result.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {feedback ? (
            <button type="button" onClick={() => { setSelectedAnswers({}); setFeedback(null); }} className="btn btn-outline w-full border-[#d9d7f5] text-[#5956d6] hover:bg-[#f4f3ff]">
              <RotateCw size={16} /> Coba lagi hari ini
            </button>
          ) : (
            <button type="button" onClick={submitAttempt} disabled={busy} className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
              {busy && <span className="loading loading-spinner loading-sm" />}
              Kirim jawaban
            </button>
          )}
        </section>
      )}

      {error && <p role="alert" className="alert alert-error text-sm">{error}</p>}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Riwayat grammar</h2>
          <p className="mt-1 text-sm text-[#7c879a]">Set latihan dan hasil yang pernah kamu kerjakan.</p>
        </div>
        {history.length === 0 ? (
          <div className="soft-card rounded-2xl p-6 text-sm text-[#7c879a]">Riwayat akan muncul setelah set latihan pertamamu dibuat.</div>
        ) : (
          <div className="space-y-3">
            {setsHistory.map((set) => {
              const isOpen = openHistory === set.id;
              const bestScore = set.attempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
              return (
                <article key={set.id} className="soft-card overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setOpenHistory(isOpen ? null : set.id)}
                    aria-expanded={isOpen}
                    className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left sm:p-5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-[#f7f8fc] text-[#69758b]"><Clock3 size={17} /></span>
                      <span>
                        <span className="block text-sm font-semibold">{formatDate(set.localDate)}</span>
                        <span className="mt-1 block text-xs text-[#8993a5]">{levelLabels[set.level] ?? set.level} · {set.attempts.length} percobaan</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {set.attempts.length > 0 && <span className="badge border-0 bg-[#f1f0ff] px-3 py-3 text-[#514dc7]">Skor terbaik {bestScore}/{set.attempts[0].total}</span>}
                      {isOpen ? <ChevronUp size={18} className="text-[#8993a5]" /> : <ChevronDown size={18} className="text-[#8993a5]" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="space-y-3 border-t border-[#edf0f5] bg-[#fcfcff] p-4 sm:p-5">
                      {set.questions.map((question, index) => (
                        <div key={question.id} className="rounded-xl border border-[#edf0f5] bg-white p-4">
                          <p className="text-sm font-medium">{index + 1}. {question.topic}</p>
                          <p className="mt-1 text-sm text-[#69758b]">{question.prompt}</p>
                          {set.attempts[0]?.answers.find((answer) => answer.questionId === question.id) && (
                            <p className="mt-2 text-xs text-[#8993a5]">
                              Jawaban terakhir: {set.attempts[0].answers.find((answer) => answer.questionId === question.id)?.selectedOption}
                              {set.attempts[0].answers.find((answer) => answer.questionId === question.id)?.isCorrect ? " · Benar" : " · Belum tepat"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
