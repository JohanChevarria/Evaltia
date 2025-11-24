"use client";

import Link from "next/link";
import {
  BookOpen, Bone, Dna, Egg, BarChart3, FlaskConical,
  HeartPulse, Bug, Pill, Activity, ChevronRight
} from "lucide-react";
import type { Course } from "./data";

// --- ESTILOS UNIFICADOS EVALTIA --- //
const CTA_BUTTON =
  "inline-flex items-center gap-1 rounded-xl px-4 py-2 bg-indigo-600 text-white font-medium shadow-[0_8px_18px_rgba(15,23,42,0.35)] hover:bg-indigo-500 transition";

const PROGRESS_FILL = "bg-indigo-500";

// Mapeo de íconos según curso
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

// Chip con icono
function IconChip({ slug }: { slug: string }) {
  const Ico = iconMap[slug] ?? BookOpen;
  return (
    <div className="h-10 w-10 rounded-xl bg-white/80 border border-black/5 shadow flex items-center justify-center">
      <Ico className="h-5 w-5 text-slate-900" />
    </div>
  );
}

// --- COMPONENTE PRINCIPAL --- //
type Props = { course: Course };

export default function CourseCard({ course }: Props) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="p-5">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <IconChip slug={course.slug} />
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
              {course.name}
            </h3>
          </div>

          {/* DESKTOP BUTTON */}
          <Link
            href={`/dashboard/main/cursos/${course.slug}`}
            className={`${CTA_BUTTON} hidden sm:inline-flex`}
          >
            Entrar
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* PROGRESO */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
            <span>Progreso</span>
            <span>{course.progress ?? 0}%</span>
          </div>

          <div className="h-2 rounded-full bg-slate-200/60 overflow-hidden">
            <div
              className={`h-full ${PROGRESS_FILL} transition-all`}
              style={{ width: `${course.progress ?? 0}%` }}
            />
          </div>
        </div>

        {/* MOBILE CTA */}
        <Link
          href={`/dashboard/main/cursos/${course.slug}`}
          className={`${CTA_BUTTON} sm:hidden w-full mt-4 justify-center`}
        >
          Entrar
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}