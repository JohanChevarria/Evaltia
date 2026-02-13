export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CourseRow = {
  id: string;
  name: string;
  cycle: number | null;
};

function groupByCycle(courses: CourseRow[]) {
  const grouped = new Map<number, CourseRow[]>();
  const withoutCycle: CourseRow[] = [];

  for (const c of courses) {
    if (typeof c.cycle === "number" && Number.isFinite(c.cycle)) {
      const list = grouped.get(c.cycle) ?? [];
      list.push(c);
      grouped.set(c.cycle, list);
    } else {
      withoutCycle.push(c);
    }
  }

  const cycles = Array.from(grouped.keys()).sort((a, b) => a - b);
  return { grouped, cycles, withoutCycle };
}

function cycleAccent(cycle: number) {
  const accents = [
    { line: "from-sky-400/70 via-indigo-300/50 to-transparent", glow: "from-sky-400/18" },
    { line: "from-indigo-400/70 via-sky-300/50 to-transparent", glow: "from-indigo-400/18" },
    { line: "from-blue-400/70 via-sky-300/45 to-transparent", glow: "from-blue-400/18" },
    { line: "from-cyan-400/70 via-sky-300/45 to-transparent", glow: "from-cyan-400/18" },
  ];
  return accents[((cycle ?? 0) - 1) % accents.length];
}

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
  if (!profile.university_id) redirect("/onboarding/university");

  const uniId = profile.university_id;

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name, cycle")
    .eq("university_id", uniId)
    .order("cycle", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  const list = (courses ?? []) as CourseRow[];
  const { grouped, cycles, withoutCycle } = groupByCycle(list);

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-7">
          {coursesError && (
            <p className="text-sm text-red-600">Error cargando cursos: {coursesError.message}</p>
          )}

          {!coursesError && (!courses || courses.length === 0) && (
            <p className="text-sm text-slate-600">
              No hay cursos configurados para tu universidad (o plan).
            </p>
          )}

          {!coursesError && courses && courses.length > 0 && (
            <div className="space-y-12">
              {cycles.map((cycle) => {
                const items = grouped.get(cycle) ?? [];
                const a = cycleAccent(cycle);

                return (
                  <div key={cycle} className="space-y-5">
                    <div className="relative">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-900/10" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-[46%] bg-gradient-to-r from-transparent via-slate-900/14 to-transparent" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-40 blur-2xl bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                      <div className={["absolute left-0 top-1/2 -translate-y-1/2 h-px w-72 bg-gradient-to-r", a.line].join(" ")} />
                      <div className={["absolute left-0 top-1/2 -translate-y-1/2 h-10 w-72 blur-2xl bg-gradient-to-r", a.glow, "to-transparent"].join(" ")} />

                      <div className="relative inline-flex items-center gap-3 rounded-2xl border border-black/5 bg-white/80 backdrop-blur px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                        <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
                          CICLO
                        </span>
                        <span className="text-base font-semibold text-slate-900">{cycle}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((c) => (
                        <Link
                          key={c.id}
                          href={`/dashboard/${uni}/main/cursos/${c.id}`}
                          className={[
                            "group relative rounded-2xl border border-black/5 bg-white/78 backdrop-blur",
                            "px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
                            "transition-all duration-200",
                            "hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)]",
                            "focus:outline-none focus:ring-2 focus:ring-sky-300/60",
                          ].join(" ")}
                          prefetch
                        >
                          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),transparent_45%,rgba(99,102,241,0.12))]" />
                          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-white/60 transition" />

                          <div className="relative z-10 flex items-center justify-between gap-4">
                            <p className="text-[15px] font-semibold text-slate-900">{c.name}</p>
                            <span className="text-sm font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}

              {withoutCycle.length > 0 && (
                <div className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-900/10" />
                    <div className="relative inline-flex items-center gap-3 rounded-2xl border border-black/5 bg-white/80 backdrop-blur px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                      <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
                        SIN CICLO
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {withoutCycle.map((c) => (
                      <Link
                        key={c.id}
                        href={`/dashboard/${uni}/main/cursos/${c.id}`}
                        className="group relative rounded-2xl border border-black/5 bg-white/78 backdrop-blur px-5 py-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)] focus:outline-none focus:ring-2 focus:ring-sky-300/60"
                        prefetch
                      >
                        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),transparent_45%,rgba(99,102,241,0.12))]" />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-white/60 transition" />

                        <div className="relative z-10 flex items-center justify-between gap-4">
                          <p className="text-[15px] font-semibold text-slate-900">{c.name}</p>
                          <span className="text-sm font-semibold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
