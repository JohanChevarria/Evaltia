// src/app/(app)/dashboard/[uni]/account/configuracion/components/SaveBar.tsx
"use client";

type Props = {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
};

export default function SaveBar({ visible, saving, onSave, onReset }: Props) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#1f2a36]/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur shadow-xl">
          <p className="text-sm text-white/85">Tienes cambios pendientes.</p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white/85 hover:bg-white/15 disabled:opacity-60"
            >
              Descartar
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600/90 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
