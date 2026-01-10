"use client";

import { Flag, MessageSquare, X } from "lucide-react";

type Props = {
  flagged: boolean;
  onToggleFlag: () => void;
  onFeedback: () => void;
  onClose: () => void;
};

export function RightControls({ flagged, onToggleFlag, onFeedback, onClose }: Props) {
  return (
    <div className="bg-white/80 backdrop-blur border border-black/10 rounded-full shadow-sm flex items-center gap-2 px-2 py-1.5">
      <button
        type="button"
        onClick={onFeedback}
        className="h-9 w-9 rounded-full bg-white border border-black/10 grid place-items-center text-slate-700 hover:bg-slate-100"
        title="Enviar feedback"
        aria-label="Enviar feedback"
      >
        <MessageSquare className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onToggleFlag}
        className={`h-9 w-9 rounded-full border grid place-items-center ${
          flagged ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-black/10 text-slate-700"
        } hover:bg-slate-100`}
        title={flagged ? "Quitar marca" : "Marcar pregunta"}
        aria-pressed={flagged}
      >
        <Flag className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onClose}
        className="h-9 w-9 rounded-full bg-white border border-black/10 grid place-items-center text-slate-700 hover:bg-slate-100"
        title="Salir"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
