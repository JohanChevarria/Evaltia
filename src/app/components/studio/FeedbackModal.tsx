"use client";

import { useEffect, useMemo, useState } from "react";
import type { FeedbackPayload } from "./FeedbackButton";

type Props = {
  open: boolean;
  onClose: () => void;
  payload: FeedbackPayload | null;
  onSubmit: (args: { payload: FeedbackPayload; message: string }) => void;
};

export default function FeedbackModal({ open, onClose, payload, onSubmit }: Props) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) setMessage("");
  }, [open, payload?.questionId, payload?.scope, payload?.optionLabel]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const title = useMemo(() => {
    if (!payload) return "Feedback";
    if (payload.scope === "option") return `Feedback de opción ${payload.optionLabel ?? ""}`;
    return "Feedback de pregunta";
  }, [payload]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className="relative mx-auto mt-24 w-[92vw] max-w-xl rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">{title}</div>
            {payload?.questionId && (
              <div className="text-xs text-slate-500 mt-1">
                ID: {payload.questionId.slice(0, 8)}…
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <label className="block text-sm font-semibold text-slate-800">Mensaje</label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Escribe el feedback…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />

          <div className="text-xs text-slate-500">
            * Por ahora esto solo hace <b>console.log</b>. Luego lo conectamos a Supabase.
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!payload || message.trim().length === 0}
            onClick={() => {
              if (!payload) return;
              onSubmit({ payload, message: message.trim() });
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:opacity-90 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
