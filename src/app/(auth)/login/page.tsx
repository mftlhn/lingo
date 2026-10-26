import { AuthForm } from "@/components/auth-form";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const params = await searchParams;
  return <AuthForm mode="login" resetSuccess={params.reset === "success"} />;
}
