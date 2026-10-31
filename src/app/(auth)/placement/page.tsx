import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { PlacementTest } from "@/components/placement-test";
import { db } from "@/lib/db";
import { placementQuestions } from "@/lib/placement-test";

export default async function PlacementPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await db.userLearningProfile.findUnique({
    where: { userId: session.user.id },
    select: { placementRequired: true },
  });
  if (!profile?.placementRequired) redirect("/dashboard");

  return (
    <PlacementTest
      questions={placementQuestions.map(({ prompt, options }) => ({ prompt, options: [...options] }))}
    />
  );
}
