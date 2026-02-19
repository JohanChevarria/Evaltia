"use client";

import Link from "next/link";
import {
  BookOpen, Bone, Dna, Egg, BarChart3, FlaskConical,
  HeartPulse, Bug, Pill, Activity, ChevronRight
} from "lucide-react";
import type { Course } from "./data";

const BRAND_BTN = "bg-gradient-to-r from-indigo-500 to-violet-500 text-white";
const BRAND_FILL = "bg-gradient-to-r from-indigo-500 to-violet-500";

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

function IconChip({ slug }: { slug: string }) {
  const Ico = iconMap[slug] ?? BookOpen;
  return (
    <div className="h-9 w-9 rounded-xl bg-white/80 ring-1 ring-white/40 shadow flex items-center justify-center">
      <Ico className="h-5 w-5 text-slate-900" />
    </div>
  );
}

type Props = { course: Course };

export default function CourseCard({ course }: Props) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/20 shadow-sm hover:shadow transition-all hover:-translate-y-0.5">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconChip slug={course.slug} />
            <h3 className="text-lg font-semibold text-slate-900">{course.name}</h3>
          </div>
          <Link
            href={`/dashboard/main/cursos/${course.slug}`}
            className={`hidden sm:inline-flex items-center gap-1 rounded-xl px-3 py-1.5 ${BRAND_BTN} shadow`}
          >
            Entrar <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
            <span>Progreso</span>
            <span>{course.progress ?? 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/50 overflow-hidden">
            <div
              className={`h-full ${BRAND_FILL} transition-all`}
              style={{ width: `${course.progress ?? 0}%` }}
            />
          </div>
        </div>

        <Link
          href={`/dashboard/main/cursos/${course.slug}`}
          className={`mt-4 sm:hidden inline-flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 ${BRAND_BTN} shadow`}
        >
          Entrar <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}