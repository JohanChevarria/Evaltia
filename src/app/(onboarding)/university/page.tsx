export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UniversityOnboardingClient from "./university-client";

type UniRow = { id: string; name: string; code: string };

export default async function UniversityOnboardingPage() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_onboarding_completed, university_id")
      .eq("id", user.id)
      .maybeSingle();

    const hasUniversity = !!profile?.university_id;
    const onboardingDone = !!profile?.university_onboarding_completed && hasUniversity;

    if (onboardingDone) {
      const { data: uni } = await supabase
        .from("universities")
        .select("code")
        .eq("id", profile!.university_id!)
        .maybeSingle();

      if (uni?.code) redirect(`/dashboard/${uni.code.toLowerCase()}/main`);
      redirect("/dashboard/main");
    }

    const { data: universities, error: uniError } = await supabase
      .from("universities")
      .select("id, name, code")
      .order("name");

    return (
      <UniversityOnboardingClient
        userId={user.id}
        universities={(universities ?? []) as UniRow[]}
        initialErrorMsg={uniError ? `Error cargando universidades: ${uniError.message}` : null}
      />
    );
  } catch (e: any) {
    return (
      <UniversityOnboardingClient
        userId={""}
        universities={[]}
        initialErrorMsg={e?.message ?? "Error inesperado en el servidor cargando onboarding."}
      />
    );
  }
}
