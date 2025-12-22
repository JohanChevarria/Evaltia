export const dynamic = "force-dynamic";

import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.university_id) {
    redirect("/dashboard/main");
  }

  const { data: uni } = await supabase
    .from("universities")
    .select("code")
    .eq("id", profile.university_id)
    .single();

  redirect(`/studio/${(uni?.code || "USMP").toLowerCase()}`);

  // Nunca debería llegar aquí, pero lo dejo para evitar warnings
  return <>{children}</>;
}
