"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import COURSES, { type Course as MockCourse } from "./data";
import {
  BookOpen,
  Bone,
  Dna,
  Egg,
  BarChart3,
  FlaskConical,
  HeartPulse,
  Bug,
  Pill,
  Activity,
  ChevronRight,
} from "lucide-react";

const CTA_BUTTON =
  "inline-flex items-center gap-1 rounded-xl px-4 py-2 bg-indigo-600 text-white font-medium shadow-[0_8px_18px_rgba(15,23,42,0.35)] hover:bg-indigo-500 transition";

const PROGRESS_FILL = "bg-indigo-500";

const iconMap: Record<string, React.ComponentType<any>> = {
  anatomia: Bone,
  histologia: Dna,
  embriologia: Egg,
  bioestadistica: BarChart3,
  bioquimica: FlaskConical,
  fisiologia: HeartPulse,
  parasitologia: Bug,
  farmacologia: Pill,
  patologia: Activity,
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function IconChip({ slug }: { slug: string }) {
  const Ico = iconMap[slug] ?? BookOpen;
  return (
    <div className="h-9 w-9 rounded-xl bg-white/80 border border-black/5 shadow flex items-center justify-center">
      <Ico className="h-5 w-5 text-slate-900" />
    </div>
  );
}

export type DbCourseForGrid = {
  id: string;
  name: string;
  slug?: string | null;
  progress?: number | null;
};

export default function CoursesGrid({
  courses,
  basePath = "/dashboard/main",
}: {
  courses?: DbCourseForGrid[];
  basePath?: string;
}) {
  const [query, setQuery] = useState("");

  const normalized = useMemo(() => {
    if (Array.isArray(courses)) {
      return courses.map((c) => ({
        id: c.id,
        name: c.name,
        slug: (c.slug ?? slugify(c.name)) as string,
        progress: typeof c.progress === "number" ? c.progress : 0,
      }));
    }

    const base = Array.isArray(COURSES) ? (COURSES as MockCourse[]) : [];
    return base.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      progress: c.progress ?? 0,
    }));
  }, [courses]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return normalized;
    return normalized.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, normalized]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600">
          Buscar cursos
        </label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe el nombre del curso…"
          className="mt-1 w-full rounded-xl border border-black/5 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IconChip slug={c.slug} />
                  <h3 className="text-lg font-semibold text-slate-900">
                    {c.name}
                  </h3>
                </div>

                <Link
                  href={`${basePath}/cursos/${c.slug}`}
                  className={`${CTA_BUTTON} hidden sm:inline-flex`}
                >
                  Entrar <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span>Progreso</span>
                  <span>{c.progress ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/60 overflow-hidden">
                  <div
                    className={`h-full ${PROGRESS_FILL} transition-all`}
                    style={{ width: `${c.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 sm:hidden">
                <Link
                  href={`${basePath}/cursos/${c.slug}`}
                  className={`${CTA_BUTTON} w-full justify-center`}
                >
                  Entrar <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-600">
          No se encontraron cursos con la búsqueda actual.
        </p>
      )}
    </div>
  );
}
