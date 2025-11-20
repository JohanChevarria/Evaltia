"use client";

import { useEffect, useMemo, useState } from "react";
import type { Course } from "./data";

type Props = {
  all: Course[];
  onChange: (filtered: Course[]) => void;
};

export default function CourseFilters({ all, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState<number | "all">("all");
  const [difficulty, setDifficulty] = useState<"all" | Course["difficulty"]>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return all.filter((c) => {
      const passQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.short.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      const passSem = semester === "all" ? true : c.semester === semester;
      const passDiff = difficulty === "all" ? true : c.difficulty === difficulty;
      return passQ && passSem && passDiff;
    });
  }, [all, query, semester, difficulty]);

  // ✅ Propagar resultados SIN disparar setState durante el render
  useEffect(() => {
    onChange(filtered);
  }, [filtered, onChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-600">Buscar</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre, tema o etiqueta…"
          className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 ring-slate-300"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600">Semestre</label>
        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 ring-slate-300"
        >
          <option value="all">Todos</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600">Dificultad</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as any)}
          className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-sm outline-none focus:ring-2 ring-slate-300"
        >
          <option value="all">Todas</option>
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
      </div>
    </div>
  );
}