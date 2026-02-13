// src/app/(auth)/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeLower(x: string | null | undefined) {
  return (x ?? "").trim().toLowerCase();
}

type ProfileRow = {
  role?: string | null;
  is_admin?: boolean | null;

  university_id?: string | null;

  // ✅ columna real
  onboarding_completed?: boolean | null;

  // legacy
  university_code?: string | null;
  uni_code?: string | null;
  university_short_name?: string | null;
};

export async function loginAndRedirect(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Ingresa tu correo y contraseña."));
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/login?error=" + encodeURIComponent(error?.message ?? "Credenciales inválidas."));
  }

  // 🔧 MUY IMPORTANTE EN SERVER ACTIONS:
  // asegura sesión aplicada en el mismo request antes de consultar tablas con RLS
  if (data.session?.access_token && data.session?.refresh_token) {
    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  }

  const userId = data.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "role, is_admin, university_id, onboarding_completed, university_code, uni_code, university_short_name"
    )
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (profileError || !profile) {
    // ✅ ERROR REAL para depurar (una sola vez)
    const msg = `ACTION_TS profiles fail | profile=${profile ? "ok" : "null"} | err=${
      profileError?.message ?? "none"
    }`;
    redirect("/login?error=" + encodeURIComponent(msg));
  }

  const isAdmin = profile.role === "admin" || profile.is_admin === true;

  const onboardingDone = profile.onboarding_completed === true;

  const legacyCode =
    profile.university_code || profile.uni_code || profile.university_short_name || null;

  const hasAnyUni = !!profile.university_id || !!legacyCode;

  if (!onboardingDone || !hasAnyUni) {
    redirect("/university");
  }

  let uniCode = legacyCode;

  if (!uniCode && profile.university_id) {
    const { data: uniRow, error: uniErr } = await supabase
      .from("universities")
      .select("code")
      .eq("id", profile.university_id)
      .maybeSingle();

    if (uniErr) {
      redirect("/login?error=" + encodeURIComponent(`ACTION_TS universities fail | ${uniErr.message}`));
    }

    uniCode = uniRow?.code ?? null;
  }

  const uni = safeLower(uniCode) || "usmp";

  if (isAdmin) redirect(`/studio/${uni}`);
  redirect(`/dashboard/${uni}/main`);
}
