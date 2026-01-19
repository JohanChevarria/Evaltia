// src/app/(app)/dashboard/[uni]/account/configuracion/action.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SettingsSavePayload } from "./components/types";

export async function saveSettings(payload: SettingsSavePayload) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return { ok: false, error: "No autorizado" };
  }

  if (payload.userId !== user.id) {
    return { ok: false, error: "No autorizado" };
  }

  // ✅ Ajusta nombres de tablas/columnas a tu schema real si difiere
  const profileUpdate = supabase
    .from("profiles")
    .update({
      first_name: payload.profile.firstName,
      last_name: payload.profile.lastName,
      gender: payload.profile.gender,
      birthdate: payload.profile.birthdate,
    })
    .eq("id", user.id);

  const prefsUpsert = supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      dark_mode: payload.preferences.darkMode,
      show_name: payload.preferences.showName,
      allow_messages: payload.preferences.allowMessages,
      public_progress: payload.preferences.publicProgress,
    },
    { onConflict: "user_id" }
  );

  const [{ error: pErr }, { error: prefErr }] = await Promise.all([
    profileUpdate,
    prefsUpsert,
  ]);

  if (pErr || prefErr) {
    return {
      ok: false,
      error: pErr?.message || prefErr?.message || "Error guardando",
    };
  }

  revalidatePath(`/dashboard/${payload.uniCode}/account/configuracion`);
  return { ok: true };
}
