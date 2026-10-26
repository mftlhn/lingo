"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@/lib/schemas";

const authFormSchema = (isRegister: boolean) =>
  loginSchema.extend({
    name: z.string().optional(),
    passwordConfirm: z.string().optional(),
    acceptedTerms: z.boolean().optional(),
  }).superRefine((values, context) => {
    if (!isRegister) return;
    const name = values.name?.trim() ?? "";
    if (name.length < 2) context.addIssue({ code: "custom", path: ["name"], message: "Nama minimal 2 karakter." });
    if (name.length > 60) context.addIssue({ code: "custom", path: ["name"], message: "Nama maksimal 60 karakter." });
    if (values.password !== values.passwordConfirm) context.addIssue({ code: "custom", path: ["passwordConfirm"], message: "Konfirmasi kata sandi belum sama." });
    if (!values.acceptedTerms) context.addIssue({ code: "custom", path: ["acceptedTerms"], message: "Setujui ketentuan untuk melanjutkan." });
  });

type AuthValues = z.infer<ReturnType<typeof authFormSchema>>;

export function AuthForm({ mode, resetSuccess = false }: { mode: "login" | "register"; resetSuccess?: boolean }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === "register";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthValues>({ resolver: zodResolver(authFormSchema(isRegister)), mode: "onTouched" });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    setServerError("");
    try {
      if (isRegister) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, name: values.name?.trim() }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setServerError(result.error ?? "Pendaftaran belum berhasil.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
      if (result?.error) {
        setServerError("Email atau kata sandi belum sesuai. Periksa kembali, ya.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Koneksi bermasalah. Periksa koneksi internet lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  });

  return (
    <div>
      <p className="text-sm font-medium text-[#5956d6]">{isRegister ? "Mulai perjalananmu" : "Selamat datang kembali"}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{isRegister ? "Buat akun gratis" : "Masuk ke akunmu"}</h1>
      <p className="mt-2 text-sm text-[#7c879a]">
        {isRegister ? "Sedikit latihan setiap hari bisa membawa perubahan besar." : "Lanjutkan perjalanan belajar bahasa Inggrismu."}
      </p>

      {resetSuccess && <div role="status" className="alert alert-success mt-6 py-3 text-sm">Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi barumu.</div>}
      {serverError && <div role="alert" className="alert alert-error mt-6 py-3 text-sm">{serverError}</div>}

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {isRegister && (
          <label className="form-control w-full">
            <span className="label-text mb-2 font-medium">Nama lengkap</span>
            <input {...register("name")} autoComplete="name" placeholder="Nama kamu" className="input input-bordered w-full bg-white" />
            {errors.name && <span className="mt-1 text-xs text-error">{errors.name.message}</span>}
          </label>
        )}
        <label className="form-control w-full">
          <span className="label-text mb-2 font-medium">Email</span>
          <input {...register("email")} type="email" autoComplete="email" placeholder="nama@email.com" className="input input-bordered w-full bg-white" />
          {errors.email && <span className="mt-1 text-xs text-error">{errors.email.message}</span>}
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-2 font-medium">Kata sandi</span>
          <span className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Minimal 8 karakter" className="input input-bordered w-full bg-white pr-12" />
            <button type="button" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setShowPassword((value) => !value)} className="btn btn-ghost btn-square btn-sm absolute right-1 top-1 text-[#7c879a]">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          {errors.password && <span className="mt-1 text-xs text-error">{errors.password.message}</span>}
        </label>
        {isRegister ? (
          <>
            <label className="form-control w-full">
              <span className="label-text mb-2 font-medium">Konfirmasi kata sandi</span>
              <input {...register("passwordConfirm")} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Ulangi kata sandi" className="input input-bordered w-full bg-white" />
              {errors.passwordConfirm && <span className="mt-1 text-xs text-error">{errors.passwordConfirm.message}</span>}
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#68748a]">
              <input {...register("acceptedTerms")} type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5" />
              <span>Saya menyetujui ketentuan penggunaan dan kebijakan privasi.</span>
            </label>
            {errors.acceptedTerms && <span className="-mt-4 block text-xs text-error">{errors.acceptedTerms.message}</span>}
          </>
        ) : (
          <div className="-mt-2 text-right">
            <Link className="text-sm font-medium text-[#5956d6] hover:underline" href="/forgot-password">Lupa kata sandi?</Link>
          </div>
        )}
        <button className="btn w-full border-0 bg-[#5956d6] text-white hover:bg-[#4744bf]" disabled={busy}>
          {busy && <span className="loading loading-spinner loading-sm" />}
          {isRegister ? "Buat akun" : "Masuk"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#7c879a]">
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link className="font-semibold text-[#5956d6] hover:underline" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Masuk" : "Daftar gratis"}
        </Link>
      </p>
    </div>
  );
}
