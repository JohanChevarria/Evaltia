"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Course = {
  id: string;
  name: string;
};

export default function EditorPage() {
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      setDebugError(null);

      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Supabase error (courses):", error);
        setError("No se pudieron cargar los cursos.");
        setDebugError(error.message);
        setLoading(false);
        return;
      }

      setCourses((data || []) as Course[]);
      setLoading(false);
    };

    fetchCourses();
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Editor de cursos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Elige un curso para gestionar sus temas y bancos de preguntas.
        </p>
      </div>

      {loading && <div className="text-sm text-gray-500">Cargando cursos…</div>}

      {error && !loading && (
        <div className="space-y-1">
          <div className="text-sm text-red-600">{error}</div>
          {debugError && (
            <div className="text-xs text-red-500">Detalle técnico: {debugError}</div>
          )}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="text-sm text-gray-500">
          No hay cursos registrados en la tabla <code>courses</code>.
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/studio/admin-studio/editor/${course.id}`}
              className="group"
            >
              <div className="h-32 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-center transition hover:shadow-md hover:border-[#3A5873]">
                <span className="text-base font-semibold text-gray-800 group-hover:text-[#3A5873]">
                  {course.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
