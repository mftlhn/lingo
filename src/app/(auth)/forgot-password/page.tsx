import Link from "next/link";
import { ForgotPasswordForm } from "@/components/password-reset-form";

export default function ForgotPasswordPage() {
  return <><ForgotPasswordForm /><p className="mt-7 text-center text-sm text-[#7c879a]"><Link href="/login" className="font-semibold text-[#5956d6] hover:underline">Kembali ke masuk</Link></p></>;
}
