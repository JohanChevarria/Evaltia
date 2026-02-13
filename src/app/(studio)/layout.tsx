// src/app/(studio)/layout.tsx
import type { ReactNode } from "react";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
}
