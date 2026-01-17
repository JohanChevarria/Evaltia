// /Users/jchevarria/Evaltia/src/app/(app)/dashboard/main/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudioPathForUniversityId } from "@/lib/studio/studio-path";

const LOGIN_PATH = "/login";
const UNIVERSITY_ONBOARDING_PATH = "/onboarding/university";

export default async function DashboardMainRedirect() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(LOGIN_PATH);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_id, university_onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(LOGIN_PATH);

  // Extra hardening: si por alguna razÃ³n cae aquÃ­ un admin, lo mandamos fuera
  if (profile.role === "admin") {
    if (!profile.university_id) redirect("/dashboard/main");

    const studioPath = await getStudioPathForUniversityId(
      supabase as any,
      profile.university_id
    );

    redirect(studioPath);
  }

  if (!profile.university_onboarding_completed || !profile.university_id) {
    redirect(UNIVERSITY_ONBOARDING_PATH);
  }

  const { data: uniRow } = await supabase
    .from("universities")
    .select("code")
    .eq("id", profile.university_id)
    .single();

  if (!uniRow?.code) redirect(UNIVERSITY_ONBOARDING_PATH);

  redirect(`/dashboard/${uniRow.code.toLowerCase()}/main`);
}

