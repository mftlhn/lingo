import Link from "next/link";
import { ResetPasswordForm } from "@/components/password-reset-form";

export default function ResetPasswordPage() {
  return <><ResetPasswordForm /><p className="mt-7 text-center text-sm text-[#7c879a]"><Link href="/forgot-password" className="font-semibold text-[#5956d6] hover:underline">Minta tautan reset baru</Link></p></>;
}
