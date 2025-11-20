"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: number | string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, maxWidth = 880, children }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.documentElement.classList.add("overflow-hidden");
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.documentElement.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        ref={backdropRef}
        onClick={(e) => e.target === backdropRef.current && onClose()}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full" style={{ maxWidth }}>
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/10 overflow-hidden animate-[modalIn_.18s_ease-out]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <h3 className="text-base font-semibold">{title}</h3>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-5">{children}</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalIn {
          from { transform: translateY(8px); opacity: .6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}