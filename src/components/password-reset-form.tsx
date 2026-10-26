"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) setError(result.error ?? "Permintaan belum berhasil.");
      else setMessage("Jika alamat email terdaftar, instruksi reset akan dikirimkan.");
    } catch {
      setError("Koneksi bermasalah. Coba lagi sebentar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Lupa kata sandi?</h1>
      <p className="mt-2 text-sm leading-6 text-[#7c879a]">Masukkan email akunmu. Jika email reset belum dikonfigurasi, kami akan memberi tahu dengan jelas.</p>
      {error && <div role="alert" className="alert alert-error mt-6 text-sm">{error}</div>}
      {message && <div role="status" className="alert alert-success mt-6 text-sm">{message}</div>}
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="form-control">
          <span className="label-text mb-2 font-medium">Email</span>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="input input-bordered bg-white" placeholder="nama@email.com" />
        </label>
        <button disabled={busy} className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">{busy && <span className="loading loading-spinner loading-sm" />} Kirim instruksi</button>
      </form>
    </>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [checkingToken, setCheckingToken] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const tokenFromFragment = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    setToken(tokenFromFragment);
    window.history.replaceState(null, "", window.location.pathname);
    setCheckingToken(false);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");
    try {
      const response = await fetch("/api/auth/password-reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, passwordConfirm }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Kata sandi belum berhasil diperbarui.");
        return;
      }
      router.replace("/login?reset=success");
    } catch {
      setError("Koneksi bermasalah. Coba lagi sebentar.");
    } finally {
      setBusy(false);
    }
  }

  if (checkingToken) return <div className="skeleton h-40 w-full" aria-label="Memeriksa tautan reset" />;
  if (!token) return <><h1 className="text-3xl font-semibold tracking-tight">Tautan tidak valid</h1><p className="mt-3 text-sm text-[#7c879a]">Minta tautan reset baru untuk melanjutkan.</p></>;
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Buat kata sandi baru</h1>
      <p className="mt-2 text-sm text-[#7c879a]">Gunakan setidaknya 8 karakter.</p>
      {error && <div role="alert" className="alert alert-error mt-6 text-sm">{error}</div>}
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="form-control"><span className="label-text mb-2 font-medium">Kata sandi baru</span><input required minLength={8} maxLength={72} name="password" type="password" autoComplete="new-password" className="input input-bordered bg-white" /></label>
        <label className="form-control"><span className="label-text mb-2 font-medium">Konfirmasi kata sandi</span><input required minLength={8} maxLength={72} name="passwordConfirm" type="password" autoComplete="new-password" className="input input-bordered bg-white" /></label>
        <button disabled={busy} className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]">{busy && <span className="loading loading-spinner loading-sm" />} Simpan kata sandi</button>
      </form>
    </>
  );
}
