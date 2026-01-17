// src/app/(app)/dashboard/[uni]/main/cursos/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardCursosPage({
  params,
}: {
  params: Promise<{ uni: string }>;
}) {
  const { uni } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("university_id, university_onboarding_completed, catalog_scope")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) redirect("/login");

  if (!profile.university_onboarding_completed) redirect("/onboarding/university");

  // âœ… fail-safe: evita query con null
  if (!profile.university_id) redirect("/onboarding/university");
  const uniId = profile.university_id;

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name, description")
    .eq("university_id", uniId)
    .order("name");

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm p-5 sm:p-7 space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Cursos</h1>

        {coursesError && (
          <p className="text-sm text-red-600">Error cargando cursos: {coursesError.message}</p>
        )}

        {!courses || courses.length === 0 ? (
          <p className="text-sm text-slate-600">
            No hay cursos configurados para tu universidad (o plan).
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/${uni}/main/cursos/${c.id}`}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:bg-slate-50 transition"
                prefetch
              >
                <p className="font-semibold text-slate-900">{c.name}</p>
                {c.description ? (
                  <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">Sin descripciÃ³n</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

