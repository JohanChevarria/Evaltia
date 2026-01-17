export const dynamic = "force-dynamic";

import React from "react";
import { redirect } from "next/navigation";
import AdminShell from "@/app/(studio)/components/AdminShell";
import { createClient } from "@/lib/supabase/server";

const LOGIN_PATH = "/login";
const FALLBACK_PATH = "/dashboard/main";

const UNIVERSITY_THEME: Record<string, { brandColor: string; accentColor: string }> = {
  USMP: { brandColor: "#8b0015", accentColor: "#2563eb" },
  UPC: { brandColor: "#0b3d91", accentColor: "#2563eb" },
  UPCH: { brandColor: "#0f766e", accentColor: "#2563eb" },
  UCSUR: { brandColor: "#166534", accentColor: "#2563eb" },
  UDEP: { brandColor: "#1f2937", accentColor: "#2563eb" },
  USIL: { brandColor: "#b45309", accentColor: "#2563eb" },
};

export default async function AdminStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(LOGIN_PATH);

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name_paterno,username,role,university_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect(LOGIN_PATH);
  if (profile.role !== "admin") redirect(FALLBACK_PATH);
  if (!profile.university_id) redirect(FALLBACK_PATH);

  const { data: uniRow } = await supabase
    .from("universities")
    .select("id, code, name")
    .eq("id", profile.university_id)
    .single();

  if (!uniRow) redirect(FALLBACK_PATH);

  const theme = UNIVERSITY_THEME[uniRow.code] ?? {
    brandColor: "#111827",
    accentColor: "#2563eb",
  };

  const university = {
    name: uniRow.name,
    shortName: uniRow.code,
    brandColor: theme.brandColor,
    accentColor: theme.accentColor,
  };

  const userName =
    profile.username ||
    [profile.first_name, profile.last_name_paterno].filter(Boolean).join(" ") ||
    user.email ||
    "Admin";

  return (
    <AdminShell university={university} userName={userName}>
      {children}
    </AdminShell>
  );
}

