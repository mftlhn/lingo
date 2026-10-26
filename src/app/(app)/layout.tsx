import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const profile = await db.userLearningProfile.findUnique({
    where: { userId: session.user.id },
    select: { timezone: true },
  });
  return <AppShell name={session.user.name ?? "Learner"} email={session.user.email ?? ""} timezone={profile?.timezone ?? "Asia/Jakarta"}>{children}</AppShell>;
}
