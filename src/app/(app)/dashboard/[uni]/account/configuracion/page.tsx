// src/app/(app)/dashboard/[uni]/account/configuracion/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

type TabKey = "perfil" | "planes" | "accesibilidad" | "privacidad" | "amigos";

type Tab = {
  key: TabKey;
  label: string;
};

export default function Page() {
  const router = useRouter();

  // ✅ En client components, NO uses params en props.
  // ✅ Leemos uni desde la URL: /dashboard/[uni]/account/configuracion
  const uni = useMemo(() => {
    if (typeof window === "undefined") return "";
    const parts = window.location.pathname.split("/").filter(Boolean);
    // ["dashboard", "{uni}", "account", "configuracion"]
    const idx = parts.indexOf("dashboard");
    return idx !== -1 && parts[idx + 1] ? parts[idx + 1] : "";
  }, []);

  const tabs: Tab[] = useMemo(
    () => [
      { key: "perfil", label: "Perfil" },
      { key: "planes", label: "Planes" },
      { key: "accesibilidad", label: "Accesibilidad" },
      { key: "privacidad", label: "Controles de privacidad" },
      { key: "amigos", label: "Amigos" },
    ],
    []
  );

  const [active, setActive] = useState<TabKey>("perfil");
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      {/* Top area limpio (sin navbar del dashboard) */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            {/* Izquierda: volver SOLO icono */}
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${uni}/main`)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
              title="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Centro: Configuración alineado a la izquierda del bloque central */}
            <div className="flex-1 flex items-center justify-start">
              <div className="flex items-center gap-3">
                {/* Logo en “chip” del mismo color clave del botón Guardar */}
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-sm">
                  <Image src="/evaltia-logo.png" alt="Evaltia" width={22} height={22} />
                </div>

                <p className="text-lg font-semibold leading-none">Configuración</p>
              </div>
            </div>

            {/* spacer para balance visual */}
            <div className="w-10" />
          </div>

          {/* Menú tipo Canva: texto + subrayado (sin íconos) */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            {tabs.map((t) => {
              const isActive = t.key === active;

              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActive(t.key)}
                  className={[
                    "relative text-sm font-semibold transition",
                    isActive ? "text-indigo-600" : "text-slate-600 hover:text-slate-900",
                  ].join(" ")}
                >
                  {t.label}
                  <span
                    className={[
                      "absolute left-0 -bottom-2 h-[2px] w-full rounded-full transition-all",
                      isActive ? "bg-indigo-600 opacity-100" : "bg-transparent opacity-0",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            {/* Transición rápida */}
            <div key={activeTab.key} className="animate-[fadeIn_120ms_ease-out]">
              <h1 className="text-xl font-bold">{activeTab.label}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Esta sección estará disponible pronto. Por ahora estamos dejando listo el menú y la navegación.
              </p>

              {/* Panel placeholder clean */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-700">
                  Próximamente podrás configurar <span className="font-semibold">{activeTab.label}</span> aquí.
                </p>
              </div>

              {/* Botón estilo Evaltia */}
              <div className="mt-6">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                  title="Aún no disponible"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
