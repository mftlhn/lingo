"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const timezones = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Australia/Sydney",
  "Europe/London",
  "America/Los_Angeles",
  "America/New_York",
];

export function SettingsForm({ initialName, initialTimezone }: { initialName: string; initialTimezone: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone }),
      });
      const result = (await response.json()) as { error?: string; name?: string; timezone?: string };
      if (!response.ok) throw new Error(result.error ?? "Pengaturan belum berhasil disimpan.");
      if (result.name) setName(result.name);
      if (result.timezone) setTimezone(result.timezone);
      setMessage("Pengaturan berhasil disimpan.");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Koneksi bermasalah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}
      {message && <div role="status" className="alert alert-success text-sm">{message}</div>}
      <label className="form-control"><span className="label-text mb-2 font-medium">Nama lengkap</span><input required minLength={2} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="input input-bordered bg-white" /></label>
      <label className="form-control"><span className="label-text mb-2 font-medium">Zona waktu untuk hari belajar</span><select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="select select-bordered bg-white">{timezones.map((zone) => <option key={zone} value={zone}>{zone.replaceAll("_", " ")}</option>)}{!timezones.includes(timezone) && <option value={timezone}>{timezone.replaceAll("_", " ")}</option>}</select><span className="mt-2 text-xs text-[#8993a5]">Tanggal Daily Vocabulary, review, dan streak dihitung menurut zona waktu ini.</span></label>
      <button disabled={busy} className="btn border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">{busy && <span className="loading loading-spinner loading-sm" />} Simpan pengaturan</button>
    </form>
  );
}
