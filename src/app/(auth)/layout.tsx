import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#5956d6] p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpenCheck size={22} /> lingo.
        </Link>
        <div className="relative z-10 max-w-lg pb-12">
          <div className="mb-5 inline-flex rounded-full bg-white/15 px-3 py-1.5 text-sm">Your daily English practice</div>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">Small steps. Real progress.</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-white/75">
            Sedikit demi sedikit, kemampuan bahasa Inggrismu bertumbuh setiap hari.
          </p>
        </div>
        <p className="text-sm text-white/60">© 2025 lingo. Belajar dengan caramu.</p>
        <div className="absolute -bottom-36 -right-24 size-[28rem] rounded-full border border-white/10" />
        <div className="absolute -bottom-24 -right-12 size-[20rem] rounded-full border border-white/10" />
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 flex items-center justify-center gap-2 text-xl font-bold lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-[#5956d6] text-white"><BookOpenCheck size={19} /></span>
            lingo<span className="text-[#5956d6]">.</span>
          </Link>
          {children}
        </div>
      </section>
    </main>
  );
}
