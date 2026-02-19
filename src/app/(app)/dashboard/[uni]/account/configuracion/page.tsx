import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import SettingsShell from "./components/SettingsShell";
import type { SettingsInitialData } from "./components/types";

type PageProps = { params: { uni: string } };

export default async function ConfiguracionPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: prefs }, { data: plan }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, first_name, last_name, gender, birthdate")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_preferences")
      .select("dark_mode, show_name, allow_messages, public_progress")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_plan")
      .select("plan_name, plan_status, valid_until")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const initial: SettingsInitialData = {
    userId: user.id,
    uniCode: params.uni,

    profile: {
      username: profile?.username ?? "",
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      gender: profile?.gender ?? "unspecified",
      birthdate: profile?.birthdate ?? null,
    },

    plan: {
      name: plan?.plan_name ?? "Versión DEMO Gratuita",
      status: plan?.plan_status ?? "demo",
      validUntil: plan?.valid_until ?? "2025-04-15",
    },

    preferences: {
      darkMode: prefs?.dark_mode ?? false,
      showName: prefs?.show_name ?? true,
      allowMessages: prefs?.allow_messages ?? false,
      publicProgress: prefs?.public_progress ?? true,
    },
  };

  return (
    <div className="evaltia-gradient-bg settings-font">
      <SettingsShell initial={initial} />
    </div>
  );
}
