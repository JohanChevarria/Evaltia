"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DbCourse = {
  id: string;
  name: string;
  description: string | null;
};

type Props = {
  open: boolean;
  userId: string;
  universityId?: string | null;
  userName: string;
  onSaved: () => void;
  onError?: (msg: string) => void;
  onMissingUniversity?: () => void;
};

export default function OnboardingCoursesOverlay({
  open,
  userId,
  universityId,
  userName,
  onSaved,
  onError,
  onMissingUniversity,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const didMissingUniRedirectRef = useRef(false);

  const [availableCourses, setAvailableCourses] = useState<DbCourse[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  function emitError(msg: string) {
    setOnboardingError(msg);
    onError?.(msg);
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadCourses() {
      setOnboardingError(null);
      setLoadingCourses(true);

      if (!universityId) {
        emitError("Primero debes elegir tu universidad para poder ver tus cursos.");
        setAvailableCourses([]);
        setLoadingCourses(false);

        if (!didMissingUniRedirectRef.current) {
          didMissingUniRedirectRef.current = true;
          onMissingUniversity?.();
        }
        return;
      }

      const tryWithDescription = await supabase
        .from("courses")
        .select("id, name, description")
        .eq("university_id", universityId)
        .order("name", { ascending: true });

      if (cancelled) return;

      if (tryWithDescription.error) {
        const tryWithoutDescription = await supabase
          .from("courses")
          .select("id, name")
          .eq("university_id", universityId)
          .order("name", { ascending: true });

        if (cancelled) return;

        if (tryWithoutDescription.error) {
          console.error("Error cargando courses:", tryWithoutDescription.error);
          setAvailableCourses([]);
          emitError(`No se pudieron cargar los cursos: ${tryWithoutDescription.error.message}`);
          setLoadingCourses(false);
          return;
        }

        setAvailableCourses(
          (tryWithoutDescription.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: null,
          }))
        );

        setLoadingCourses(false);
        return;
      }

      setAvailableCourses(
        (tryWithDescription.data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description ?? null,
        }))
      );

      setLoadingCourses(false);
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, [open, supabase, universityId, onMissingUniversity]);

  function toggleCourse(id: string) {
    setOnboardingError(null);
    setSelectedCourseIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        emitError("Solo puedes elegir hasta 3 cursos.");
        return prev;
      }
      return [...prev, id];
    });
  }

  async function handleOnboardingSave() {
    setOnboardingError(null);

    if (selectedCourseIds.length === 0) {
      emitError("Elige al menos 1 curso para continuar.");
      return;
    }

    setOnboardingSaving(true);

    const selectedCourses = availableCourses.filter((c) => selectedCourseIds.includes(c.id));
    const selectedNames = selectedCourses.map((c) => c.name);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        selected_courses: selectedNames,
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (profileError) {
      console.error(profileError);
      emitError(`Ocurrió un error guardando tu selección: ${profileError.message}`);
      setOnboardingSaving(false);
      return;
    }

    const inserts = selectedNames.map((name) => ({
      user_id: userId,
      course_name: name,
      correctas: 0,
      incorrectas: 0,
      total: 0,
    }));

    const { error: progressError } = await supabase.from("course_progress").insert(inserts);
    if (progressError) console.error(progressError);

    setOnboardingSaving(false);
    onSaved();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">Bienvenido, {userName}</p>
          <h2 className="text-2xl font-bold text-slate-900">¿En qué cursos te enfocarás este ciclo?</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Selecciona hasta <span className="font-semibold">3 cursos</span> para personalizar tu panel.
          </p>
        </div>

        {onboardingError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
            {onboardingError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[340px] overflow-y-auto pr-1">
          {loadingCourses ? (
            <div className="col-span-full flex items-center justify-center py-10">
              <div className="h-6 w-6 rounded-full border border-slate-300 border-t-transparent animate-spin" />
            </div>
          ) : (
            availableCourses.map((course) => {
              const selected = selectedCourseIds.includes(course.id);
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => toggleCourse(course.id)}
                  className={`text-left rounded-xl border p-4 transition shadow-sm ${
                    selected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900">{course.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {course.description || "Curso del ciclo de medicina."}
                  </p>
                  <div className="mt-3 text-xs font-semibold text-indigo-600">{selected ? "Seleccionado" : "Elegir"}</div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleOnboardingSave}
            disabled={onboardingSaving || loadingCourses}
            className="px-5 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {onboardingSaving ? "Guardando..." : "Guardar y entrar a mi panel"}
          </button>
        </div>
      </div>
    </div>
  );
}
