import Link from "next/link";
import { ArrowRight, BookOpenCheck, BrainCircuit, Sparkles } from "lucide-react";
import { auth } from "../../auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-[#5956d6] text-white">
            <BookOpenCheck size={19} />
          </span>
          lingo<span className="text-[#5956d6]">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn btn-ghost btn-sm">Masuk</Link>
          <Link href="/register" className="btn btn-primary btn-sm border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">
            Mulai belajar
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-28 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f1f0ff] px-3 py-1.5 text-sm font-medium text-[#514dc7]">
            <Sparkles size={15} /> Belajar sedikit, setiap hari
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight text-[#172033] sm:text-6xl">
            Satu hari lebih dekat ke{" "}
            <span className="text-[#5956d6]">English yang lancar.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#778198]">
            Sepuluh kata baru sehari, latihan yang terasa ringan, dan tutor AI
            yang selalu siap menemanimu. Dibuat khusus untuk perjalananmu.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/register" className="btn h-12 border-0 bg-[#5956d6] px-6 text-white hover:bg-[#4744bf]">
              Mulai gratis <ArrowRight size={17} />
            </Link>
            <span className="text-sm text-[#858ea1]">Tanpa kartu kredit · Belajar dengan ritmemu</span>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#eceef3] pt-6 text-sm text-[#69758b]">
            <span className="flex items-center gap-2"><BookOpenCheck size={16} className="text-[#5956d6]" /> 10 kata pilihan setiap hari</span>
            <span className="flex items-center gap-2"><BrainCircuit size={16} className="text-[#5956d6]" /> Review cerdas dan personal</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2rem] bg-[#f2f1ff]" />
          <div className="soft-card relative rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#818ba0]">Preview · contoh kosakata</p>
                <h2 className="mt-1 text-xl font-semibold">A closer look</h2>
              </div>
              <span className="badge border-0 bg-[#f1f0ff] text-[#514dc7]">10 kata</span>
            </div>
            <div className="mt-6 rounded-2xl bg-[#f8f8fd] p-5">
              <p className="text-3xl font-semibold tracking-tight">resilient</p>
              <p className="mt-1 text-sm text-[#818ba0]">/rɪˈzɪl.jənt/ · adjective</p>
              <p className="mt-4 text-[15px] text-[#3e4a60]">mampu bangkit kembali</p>
              <div className="mt-4 border-l-2 border-[#c3c0ff] pl-3 text-sm leading-6 text-[#69758b]">
                She stayed resilient through every challenge.
                <span className="mt-1 block text-xs text-[#919bad]">Dia tetap tegar menghadapi setiap tantangan.</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {["Arti kontekstual", "Panduan pelafalan", "Contoh bilingual"].map((label) => (
                <div key={label} className="rounded-xl border border-[#eceef3] p-3 text-center">
                  <p className="text-[10px] font-medium text-[#69758b] sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#eceef3] bg-[#fafbfe] px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
          {[
            ["01", "Belajar 10 kata", "Kosakata baru yang dipersonalisasi, dengan arti dan contoh yang mudah dipahami."],
            ["02", "Ulangi di waktu tepat", "Sistem review adaptif membantumu mengingat kata lebih lama."],
            ["03", "Berani ngobrol", "Latihan percakapan bahasa Inggris dengan tutor AI yang suportif."],
          ].map(([number, title, body]) => (
            <div key={number} className="rounded-2xl border border-[#eceef3] bg-white p-6">
              <p className="text-sm font-semibold text-[#5956d6]">{number}</p>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#778198]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
