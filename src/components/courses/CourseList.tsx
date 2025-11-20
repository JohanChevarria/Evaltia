"use client";

import { useMemo, useState } from "react";
import CourseCard from "./CourseCard";
import COURSES, { type Course } from "./data";

export default function CourseList() {
  const [query, setQuery] = useState("");

  const filtered: Course[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = Array.isArray(COURSES) ? COURSES : [];
    if (!q) return base;
    return base.filter(c => c.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cursos</h2>
        <span className="text-sm text-slate-600">{filtered.length} cursos</span>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-600">Buscar cursos</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Escribe el nombre del curso…"
          className="mt-1 w-full rounded-xl border border-white/20 bg-white/70 backdrop-blur px-3 py-2 text-sm outline-none focus:ring-2 ring-indigo-300"
        />
      </div>

      {/* Máx 2 por fila */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-slate-600">No se encontraron cursos con la búsqueda actual.</p>
      )}
    </div>
  );
}