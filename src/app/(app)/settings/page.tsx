import { auth } from "../../../../auth";
import Link from "next/link";
import { SettingsForm } from "@/components/settings-form";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth();
  const profile = await db.userLearningProfile.upsert({
    where: { userId: session!.user.id },
    create: { userId: session!.user.id },
    update: {},
  });
  const user = await db.user.findUniqueOrThrow({
    where: { id: session!.user.id },
    select: { name: true, email: true },
  });
  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header><p className="text-sm text-[#8a94a6]">Your account</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Pengaturan</h1><p className="mt-1.5 text-sm text-[#7c879a]">Atur profil dan preferensi waktu belajarmu.</p></header>
      <section className="soft-card rounded-2xl p-5 sm:p-7">
        <h2 className="mb-5 font-semibold">Profil belajar</h2>
        <SettingsForm initialName={user.name} initialTimezone={profile.timezone} />
        <div className="mt-6 border-t border-[#edf0f5] pt-5"><p className="text-sm font-medium">Alamat email</p><p className="mt-1 text-sm text-[#7c879a]">{user.email}</p><p className="mt-2 text-xs text-[#8993a5]">Untuk mengubah email, hubungi dukungan.</p></div>
      </section>
      <section className="soft-card rounded-2xl p-5 sm:p-7"><h2 className="font-semibold">Keamanan akun</h2><p className="mt-2 text-sm text-[#7c879a]">Kata sandi dienkripsi dan tidak dapat dilihat oleh siapa pun.</p><Link href="/forgot-password" className="btn btn-outline btn-sm mt-4 border-[#e2e4ee]">Reset kata sandi</Link></section>
    </div>
  );
}
