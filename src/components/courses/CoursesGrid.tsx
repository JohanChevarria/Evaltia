"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import COURSES, { type Course } from "./data";
import {
  BookOpen, Bone, Dna, Egg, BarChart3, FlaskConical,
  HeartPulse, Bug, Pill, Activity, ChevronRight
} from "lucide-react";

/* ==== Colores de marca (azules del landing) ==== */
const BRAND_BASE = "#0D1D35";   // azul oscuro del landing (ajústalo si tienes el HEX exacto)
const BRAND_BASE_2 = "#16355F"; // tono más claro para el bisel
const PROGRESS_FROM = "#1E3A8A"; // blue-800
const PROGRESS_TO   = "#60A5FA"; // sky-400

/* ==== Iconografía por curso ==== */
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

/* ==== Botón con reflejo — capas ordenadas (z-index) y texto arriba ==== */
function BrandButton({
  href,
  children,
  className = "",
  mobile = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  mobile?: boolean;
}) {
  return (
    <Link href={href} className={className + (mobile ? " block w-full" : "")}>
      <span
        className={
          // 👇 añadimos `group` aquí, no afuera
          "relative isolate group inline-flex items-center justify-center gap-1 rounded-xl " +
          (mobile ? "px-3 py-2 w-full" : "px-3 py-1.5")
        }
        style={{ color: "#fff" }}
      >
        {/* Fondo principal (debajo) */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl z-0"
          style={{
            background: `linear-gradient(180deg, ${BRAND_BASE} 0%, ${BRAND_BASE_2} 100%)`,
          }}
        />
        {/* Borde/sombras (debajo) */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl z-0 ring-1 ring-white/15 shadow-[0_10px_30px_-12px_rgba(13,29,53,.7),inset_0_1px_0_rgba(255,255,255,.15)]"
        />
        {/* Reflejo superior fijo (debajo) */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl z-0"
          style={{
            background:
              "linear-gradient( to bottom, rgba(255,255,255,.18) 0%, rgba(255,255,255,.08) 16%, rgba(255,255,255,0) 42% )",
          }}
        />
        {/* Sheen animado en hover (debajo del texto) */}
        <span aria-hidden className="pointer-events-none absolute -inset-1 rounded-xl z-0 opacity-0 group-hover:opacity-50">
          <span className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-white/40 blur-xl will-change-transform group-hover:animate-[sheen_1100ms_ease] rounded-xl" />
        </span>

        {/* Contenido encima de todo */}
        <span className="relative z-10 flex items-center gap-1 text-white font-medium drop-shadow-[0_1px_1px_rgba(0,0,0,.35)]">
          {children}
        </span>
      </span>

      {/* Keyframes del sheen */}
      <style jsx global>{`
        @keyframes sheen {
          0%   { transform: translateX(-160%) rotate(12deg); }
          100% { transform: translateX(260%) rotate(12deg); }
        }
      `}</style>
    </Link>
  );
}

/* ==== Grid de cursos ==== */
export default function CoursesGrid() {
  const [query, setQuery] = useState("");

  const filtered: Course[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = Array.isArray(COURSES) ? COURSES : [];
    if (!q) return base;
    return base.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-4">
      {/* Buscador (explícito que busca cursos) */}
      <div>
        <label className="block text-xs font-medium text-slate-600">Buscar cursos</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe el nombre del curso…"
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/70 backdrop-blur px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-300"
        />
      </div>

      {/* Máximo 2 por fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl bg-white/70 backdrop-blur border border-white/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <IconChip slug={c.slug} />
                  <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
                </div>

                {/* CTA desktop */}
                <BrandButton href={`/dashboard/main/cursos/${c.slug}`}>
                  Entrar <ChevronRight className="h-4 w-4" />
                </BrandButton>
              </div>

              {/* Progreso (a juego) */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span>Progreso</span>
                  <span>{c.progress ?? 0}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/50 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${c.progress ?? 0}%`,
                      background: `linear-gradient(90deg, ${PROGRESS_FROM} 0%, ${PROGRESS_TO} 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* CTA móvil */}
              <div className="mt-4 sm:hidden">
                <BrandButton href={`/dashboard/main/cursos/${c.slug}`} mobile>
                  Entrar <ChevronRight className="h-4 w-4" />
                </BrandButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-600">No se encontraron cursos con la búsqueda actual.</p>
      )}
    </div>
  );
}