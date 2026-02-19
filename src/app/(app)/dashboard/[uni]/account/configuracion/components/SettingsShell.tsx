"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { SettingsInitialData, SettingsSavePayload } from "./types";
import { saveSettings } from "../action";

import { ChevronLeft } from "lucide-react";

import SaveBar from "./SaveBar";
import ProfileSection from "./sections/ProfileSection";
import PlanSection from "./sections/PlanSection";
import AccessibilitySection from "./sections/AccessibilitySection";
import PrivacySection from "./sections/PrivacySection";
import FriendsSection from "./sections/FriendsSection";

type Props = { initial: SettingsInitialData };

function deepEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function SettingsShell({ initial }: Props) {
  const [state, setState] = useState<SettingsInitialData>(initial);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const initialRef = useRef<SettingsInitialData>(initial);

  useEffect(() => {
    initialRef.current = initial;
    setState(initial);
  }, [initial]);

  const dirty = useMemo(() => !deepEqual(state, initialRef.current), [state]);

  const payload: SettingsSavePayload = useMemo(
    () => ({
      userId: state.userId,
      uniCode: state.uniCode,
      profile: state.profile,
      preferences: state.preferences,
    }),
    [state]
  );

  function onSave() {
    startTransition(async () => {
      const res = await saveSettings(payload);
      if (!res.ok) {
        setToast({ type: "err", msg: res.error ?? "Error guardando" });
        return;
      }
      initialRef.current = state;
      setToast({ type: "ok", msg: "Cambios guardados" });
    });
  }

  function onReset() {
    setState(initialRef.current);
    setToast(null);
  }

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}
      >
        <div className="mx-auto max-w-4xl px-4 py-4 border-b border-black/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => history.back()}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft className="w-5 h-5 text-slate-900" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Configuración</h1>
              <p className="text-sm text-slate-600">Gestiona tu cuenta y preferencias</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <ProfileSection
          value={state.profile}
          onChange={(next) => setState((s) => ({ ...s, profile: next }))}
        />

        <PlanSection plan={state.plan} />

        <AccessibilitySection
          darkMode={state.preferences.darkMode}
          onToggle={(v) =>
            setState((s) => ({
              ...s,
              preferences: { ...s.preferences, darkMode: v },
            }))
          }
        />

        <PrivacySection
          value={state.preferences}
          onChange={(next) =>
            setState((s) => ({
              ...s,
              preferences: next,
            }))
          }
        />

        <FriendsSection />

        {toast && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
            <div
              className={[
                "rounded-2xl px-4 py-3 text-sm shadow-lg backdrop-blur",
                toast.type === "ok"
                  ? "bg-emerald-500/20 text-emerald-50 ring-1 ring-emerald-300/30"
                  : "bg-red-500/20 text-red-50 ring-1 ring-red-300/30",
              ].join(" ")}
            >
              {toast.msg}
            </div>
          </div>
        )}
      </main>

      <SaveBar visible={dirty} saving={isPending} onSave={onSave} onReset={onReset} />
    </>
  );
}
