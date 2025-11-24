"use client";

import { useEffect, useMemo, useState } from "react";
import type { Course } from "./data";

type Props = {
  all: Course[];
  onChange: (filtered: Course[]) => void;
};

export default function CourseFilters({ all, onChange }: Props) {
  const [query, setQuery] = useState("");

  // Filtrar solo por nombre del curso
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return all;

    return all.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [all, query]);

  // Mandar al padre la lista filtrada
  useEffect(() => {
    onChange(filtered);
  }, [filtered, onChange]);

  return (
    <div className="space-y-1 mb-4">
      <label className="block text-sm font-medium text-slate-700">
        Buscar cursos
      </label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Escribe el nombre del curso..."
        className="w-full rounded-xl border border-black/5 bg-white/80 px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-slate-300"
      />
    </div>
  );
}