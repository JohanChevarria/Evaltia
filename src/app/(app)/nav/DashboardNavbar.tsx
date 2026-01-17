// src/app/(app)/nav/DashboardNavbar.tsx
"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Users, User, Settings, LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// ✅ IMPORT DEL CLIENTE SUPABASE
import { createClient } from "@/lib/supabase/client";

type Tab = { label: string; short: string; href: string };

export default function DashboardNavbar({ uni }: { uni: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const base = `/dashboard/${uni}/main`;
  const baseAccount = `/dashboard/${uni}/account`;

  const tabs: Tab[] = useMemo(
    () => [
      { label: "Inicio", short: "Inicio", href: base },
      { label: "Cursos", short: "Cursos", href: `${base}/cursos` },
      { label: "Progreso", short: "Progreso", href: `${base}/progreso` },
      { label: "Calendario", short: "Calen.", href: `${base}/calendario` },
      { label: "Clasificaciones", short: "Clasif.", href: `${base}/clasificaciones` },
    ],
    [base]
  );

  useEffect(() => {
    tabs.forEach((tab) => router.prefetch(tab.href));
    router.prefetch(`${baseAccount}/amigos`);
    router.prefetch(`${baseAccount}/configuracion`);
  }, [router, tabs, baseAccount]);

  // Dropdown control
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cierra al hacer click fuera
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!profileOpen) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [profileOpen]);

  // Handlers
  const goConfig = () => {
    setProfileOpen(false);
    router.push(`${baseAccount}/configuracion`);
  };

  // ✅ LOGOUT REAL (CLIENT-SIDE, SUPABASE)
  const logout = async () => {
    setProfileOpen(false);

    const supabase = createClient();
    await supabase.auth.signOut();

    // ✅ manda al landing
    window.location.href = "/";
  };

  return (
    <div className="relative z-50 grid grid-cols-[auto,minmax(0,1fr),auto] items-center gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <Image src="/evaltia-logo.png" alt="Evaltia" width={36} height={36} />
        <span className="font-semibold text-lg leading-none hidden sm:inline">
          Evaltia
        </span>
      </div>

      {/* Centro: tabs */}
      <div className="min-w-0">
        <div className="mx-auto max-w-full overflow-hidden">
          <div className="flex justify-center">
            <div className="flex gap-2 rounded-full border border-white/25 bg-white/15 backdrop-blur-md p-1 shadow-sm max-w-full">
              {tabs.map((t) => {
                const active = pathname === t.href;

                return (
                  <button
                    key={t.href}
                    type="button"
                    onClick={() => router.push(t.href)}
                    className={[
                      "rounded-full font-medium transition-all whitespace-nowrap",
                      "px-3 py-2 text-sm sm:px-4 md:px-5",
                      active
                        ? "bg-white text-slate-900"
                        : "text-white hover:bg-white/20 hover:backdrop-blur-sm",
                    ].join(" ")}
                    title={t.label}
                  >
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Derecha: Amigos + Perfil */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => router.push(`${baseAccount}/amigos`)}
          title="Amigos"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 hover:bg-white/25 hover:backdrop-blur-sm transition-all"
        >
          <Users className="h-4 w-4" />
        </button>

        {/* Perfil + dropdown */}
        <div className="relative z-50" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            title="Perfil"
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition-all",
              profileOpen
                ? "bg-white/25"
                : "bg-white/10 hover:bg-white/25 hover:backdrop-blur-sm",
            ].join(" ")}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
          >
            <User className="h-4 w-4" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/20 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden z-50"
              role="menu"
            >
              <button
                type="button"
                onClick={goConfig}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
                role="menuitem"
              >
                <Settings className="h-4 w-4 opacity-90" />
                <span>Configuración</span>
              </button>

              <div className="h-px bg-white/10" />

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
                role="menuitem"
              >
                <LogOut className="h-4 w-4 opacity-90" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
