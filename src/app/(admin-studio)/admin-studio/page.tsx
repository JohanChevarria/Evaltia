export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminStudioEntry() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_id")
    .eq("id", user.id)
    .single();

  // si no es admin, fuera
  if (!profile || profile.role !== "admin" || !profile.university_id) {
    redirect("/dashboard/main");
  }

  // busca el code de su universidad
  const { data: uni } = await supabase
    .from("universities")
    .select("code")
    .eq("id", profile.university_id)
    .single();

  redirect(`/studio/${(uni?.code || "USMP").toLowerCase()}`);
}
