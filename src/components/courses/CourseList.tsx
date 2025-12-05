"use client";

import { useEffect, useMemo, useState } from "react";
import CourseCard from "./CourseCard";
import { supabase } from "../../lib/supabase";
import type { Course } from "./data"; // 👈 usamos el MISMO tipo que CourseCard

// Tipo para lo que viene de la BD (puede traer progress null)
type DbCourse = {
  id: string;
  slug: string;
  name: string;
  progress: number | null;
};

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, name, progress")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error cargando cursos:", error.message);
        setCourses([]);
      } else if (data) {
        // 👇 normalizamos lo que viene de Supabase al tipo Course del frontend
        const normalized: Course[] = (data as DbCourse[]).map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          progress: c.progress ?? 0, // nunca null → siempre número
        }));

        setCourses(normalized);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter((c) => c.name.toLowerCase().includes(q));
  }, [courses, query]);

  if (loading) {
    return <div className="text-slate-600">Cargando cursos…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cursos</h2>
        <span className="text-sm text-slate-600">
          {filtered.length} cursos
        </span>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-600">
          Buscar cursos
        </label>
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
        <p className="text-sm text-slate-600">
          No se encontraron cursos con la búsqueda actual.
        </p>
      )}
    </div>
  );
}