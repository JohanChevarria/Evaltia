"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UniRow = { id: string; name: string; code: string };
type UniLogoMap = Record<string, string>;

type Props = {
  userId: string;
  universities: UniRow[];
  initialErrorMsg: string | null;
};

export default function UniversityOnboardingClient({ userId, universities, initialErrorMsg }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const didNavigateRef = useRef(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialErrorMsg);

  const [selectedMode, setSelectedMode] = useState<"university" | "general" | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);

  const LOGOS: UniLogoMap = {
    UCSUR: "/universities/ucsur.png",
    UDEP: "/universities/udep.png",
    USMP: "/universities/usmp.png",
    UPCH: "/universities/upch.png",
    UPC: "/universities/upc.png",
    USIL: "/universities/usil.png",
  };

  const canContinue =
    !!userId &&
    (selectedMode === "general" || (selectedMode === "university" && !!selectedUniversityId));

  async function handleContinue() {
    setErrorMsg(null);

    if (!userId) {
      setErrorMsg("No se pudo obtener el usuario. Vuelve a iniciar sesión.");
      return;
    }

    if (!selectedMode) {
      setErrorMsg("Selecciona una opción para continuar.");
      return;
    }

    if (selectedMode === "university" && !selectedUniversityId) {
      setErrorMsg("Elige una universidad para continuar.");
      return;
    }

    setSaving(true);

    const payload =
      selectedMode === "university"
        ? {
            university_id: selectedUniversityId,
            catalog_scope: "university",
            university_onboarding_completed: true,
          }
        : {
            university_id: null,
            catalog_scope: "general",
            university_onboarding_completed: true,
          };

    const { error: updateError } = await supabase.from("profiles").update(payload).eq("id", userId);

    if (updateError) {
      setSaving(false);
      setErrorMsg(`No pude guardar tu universidad. Error: ${updateError.message}`);
      return;
    }

    setSaving(false);

    if (!didNavigateRef.current) {
      didNavigateRef.current = true;

      if (selectedMode === "university") {
        const chosen = universities.find((u) => u.id === selectedUniversityId);
        if (chosen?.code) {
          router.replace(`/dashboard/${chosen.code.toLowerCase()}/main`);
          return;
        }
      }

      router.replace("/dashboard/main");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-16 text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 30% 70%, rgba(176,196,222,0.15) 0%, transparent 50%),
            linear-gradient(135deg,
              #2c3e50 0%,
              #3a506b 25%,
              #435e79 50%,
              #516b87 75%,
              #5f7995 100%
            )
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.05) contrast(1.05)",
        }}
      />

      <div className="relative z-10 w-full max-w-4xl bg-white shadow-2xl rounded-2xl p-8 space-y-6 text-slate-900">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">Personalización inicial</p>
          <h1 className="text-2xl font-bold">Elige tu universidad para personalizar tu experiencia</h1>
          <p className="text-sm text-slate-600">
            Así adaptamos cursos y prácticas desde el inicio. Es rápido y solo lo harás una vez.
          </p>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
            {errorMsg}
            {!userId && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => router.replace("/login")}
                  className="text-xs font-semibold text-indigo-700 hover:underline"
                >
                  Volver a login
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {universities.map((u) => {
            const selected = selectedMode === "university" && selectedUniversityId === u.id;
            const logoSrc = LOGOS[u.code];

            return (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setSelectedMode("university");
                  setSelectedUniversityId(u.id);
                }}
                className={`rounded-2xl border p-6 text-center transition ${
                  selected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  {logoSrc ? (
                    <Image src={logoSrc} alt={u.code} width={44} height={44} className="object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-slate-700">{u.code}</span>
                  )}
                </div>

                <div className="mt-4 min-h-[76px] flex flex-col items-center justify-center">
                  <p className="font-semibold leading-snug text-center">{u.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{u.code}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedMode("general");
            setSelectedUniversityId(null);
          }}
          className={`w-full rounded-2xl border p-6 text-left transition ${
            selectedMode === "general" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <p className="font-semibold">Plan General</p>
          <p className="text-sm text-slate-600 mt-1">
            Si tu universidad no está en la lista, igual puedes organizar tus prácticas a tu manera.
          </p>
        </button>

        <button
          type="button"
          disabled={!canContinue || saving}
          onClick={handleContinue}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Continuar"}
        </button>
      </div>
    </main>
  );
}
