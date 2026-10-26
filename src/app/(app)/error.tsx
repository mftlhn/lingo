"use client";

export default function LearningError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="soft-card mx-auto max-w-lg rounded-2xl p-8 text-center sm:p-10">
      <h1 className="text-xl font-semibold">Halaman belum bisa dimuat</h1>
      <p className="mt-2 text-sm leading-6 text-[#7c879a]">Terjadi kendala saat mengambil data. Coba muat ulang halaman.</p>
      <button onClick={reset} className="btn mt-5 border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">Coba lagi</button>
    </div>
  );
}
