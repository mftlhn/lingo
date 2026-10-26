import { auth } from "../../../../auth";
import { QuizRunner } from "@/components/quiz-runner";

export default async function PracticePage() {
  await auth();
  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <header><p className="text-sm text-[#8a94a6]">Practice & quizzes</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Latihan & kuis</h1><p className="mt-1.5 text-sm text-[#7c879a]">Perkuat ingatanmu dengan kuis singkat dari kosakata yang telah dipelajari.</p></header>
      <QuizRunner />
    </div>
  );
}
