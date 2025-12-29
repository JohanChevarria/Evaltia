// src/app/(app)/dashboard/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_id, university_onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");

  const role = profile.role ?? "student";

  if (role === "admin" || role === "superadmin") {
    redirect("/admin-studio");
  }

  if (!profile.university_onboarding_completed) {
    redirect("/onboarding/university");
  }

  return children;
}
