// src/lib/getCourses.ts
import { createClient } from "@/lib/supabase/server";

export async function getCourses() {
  const supabase = await createClient(); // ✅ OJO: createClient() devuelve Promise en tu proyecto

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
