// src/app/(auth)/layout.tsx
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: `
          radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
          radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
          linear-gradient(135deg, #2c3e50 0%, #3a506b 30%, #435e79 55%, #516b87 78%, #5f7995 100%)
        `,
        backgroundBlendMode: "soft-light, screen, normal",
        filter: "brightness(1.02) contrast(1.04)",
      }}
    >
      {children}
    </div>
  );
}
