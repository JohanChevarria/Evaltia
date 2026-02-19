import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudioPathForUniversityId } from "@/lib/studio/studio-path";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_id, university_onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const role = profile.role ?? "student";

  if (role === "admin") {
    if (!profile.university_id) {
      redirect("/dashboard/main");
    }

    const studioPath = await getStudioPathForUniversityId(
      supabase as any,
      profile.university_id
    );

    redirect(studioPath);
  }

  if (!profile.university_onboarding_completed) {
    redirect("/university");
  }

  return <>{children}</>;
}
