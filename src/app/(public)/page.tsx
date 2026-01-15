// File: /Users/jchevarria/Evaltia/src/app/(public)/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HeroEvaltia } from "./public components/HeroEvaltia";

export default function Home() {
  const [pos, setPos] = useState({ x: 60, y: 30 });
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Mantiene tu paleta. Solo añade un shift MUY sutil (1–3%) con mouse/scroll.
  const bgStyle = useMemo(() => {
    const s = Math.min(scroll / 900, 1); // 0..1
    const x = pos.x + s * 1.8;
    const y = pos.y + s * 1.2;

    return {
      background: `
        radial-gradient(circle at ${x}% ${y}%,
          rgba(255, 255, 255, 0.10) 0%,
          transparent 55%),
        radial-gradient(circle at ${100 - x}% ${100 - y}%,
          rgba(176, 196, 222, 0.18) 0%,
          transparent 55%),
        linear-gradient(135deg,
          #2c3e50 0%,
          #3a506b 25%,
          #435e79 50%,
          #516b87 75%,
          #5f7995 100%
        )
      `,
      backgroundBlendMode: "soft-light, screen, normal",
      filter: "brightness(1.03) contrast(1.05)",
    } as React.CSSProperties;
  }, [pos.x, pos.y, scroll]);

  return (
    <main
      className="relative min-h-screen w-full text-white overflow-hidden"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        // suaviza
        setPos((p) => ({ x: p.x * 0.88 + x * 0.12, y: p.y * 0.88 + y * 0.12 }));
      }}
    >
      {/* Fondo tipo “moonlit fog” */}
      <div className="absolute inset-0 z-0" style={bgStyle} />

      {/* Grain MUY leve (premium) */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        }}
      />

      {/* HEADER (premium claro, no dark) */}
      <header className="relative z-10 w-full px-6 pt-4 sticky top-0">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/18 bg-white/10 backdrop-blur-md shadow-[0_12px_30px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/evaltia-logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                  className="rounded-lg"
                />
                <span className="text-white text-lg font-semibold tracking-tight">
                  Evaltia
                </span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  href="/#como-funciona"
                  className="hidden sm:inline-flex text-white/90 text-sm hover:text-white transition"
                >
                  Cómo funciona
                </Link>

                <Link
                  href="/login"
                  className="text-white/90 text-sm hover:text-white transition px-3 py-2 rounded-xl hover:bg-white/10"
                >
                  Iniciar sesión
                </Link>

                <Link
                  href="/register"
                  className="bg-white text-[#0b1a2b] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/90 transition shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
                >
                  Probar demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* LANDING */}
      <div className="relative z-10">
        <HeroEvaltia />
      </div>

      {/* FOOTER (igual que tu base, solo alineado) */}
      <footer className="relative z-10 bg-white/10 backdrop-blur-md text-gray-200 pt-16 pb-10 px-6 border-t border-white/15">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Evaltia</h4>
            <p className="text-white/80 text-xs leading-relaxed">
              Plataforma de estudio médico adaptada a tu ritmo. Simulacros, progreso y repaso inteligente.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Compañía</h4>
            <ul className="space-y-1 text-white/85">
              <li><a href="#" className="hover:text-white transition">Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Cursos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-1 text-white/85">
              <li><a href="#" className="hover:text-white transition">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-white transition">Política de privacidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Soporte</h4>
            <ul className="space-y-1 text-white/85">
              <li><a href="#" className="hover:text-white transition">Centro de ayuda</a></li>
              <li>
                <a href="mailto:soporte@evaltia.com" className="hover:text-white transition">
                  soporte@evaltia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 mt-10 pt-6 text-center text-xs text-white/70">
          © {new Date().getFullYear()} Evaltia. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}
