import { createClient } from "@/lib/supabase/server";

export async function getCourses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
