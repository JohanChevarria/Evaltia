"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Users, Settings, User } from "lucide-react";

export default function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { uni: string };
}) {
  const pathname = usePathname();
  const router = useRouter();

  const base = `/dashboard/${params.uni}/main`;

  const tabs = [
    { label: "Inicio", short: "Inicio", href: base },
    { label: "Cursos", short: "Cursos", href: `${base}/cursos` },
    { label: "Progreso", short: "Progreso", href: `${base}/progreso` },
    { label: "Calendario", short: "Calen.", href: `${base}/calendario` },
    { label: "Clasificaciones", short: "Clasif.", href: `${base}/clasificaciones` },
  ];

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* Fondo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
            linear-gradient(135deg, #2c3e50 0%, #3a506b 30%, #435e79 55%, #516b87 78%, #5f7995 100%)
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.02) contrast(1.04)",
        }}
      />

      <section className="relative z-10 px-6 pt-7 pb-10 max-w-7xl mx-auto">
        {/* ✅ Topbar SIN superposiciones: 3 columnas reales */}
        <div className="grid grid-cols-[auto,minmax(0,1fr),auto] items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Image src="/evaltia-logo.png" alt="Evaltia" width={36} height={36} />
            <span className="font-semibold text-lg leading-none hidden sm:inline">Evaltia</span>
          </div>

          {/* Centro: ✅ toma el espacio disponible, pero NO invade derecha */}
          <div className="min-w-0">
            <div className="mx-auto max-w-full overflow-hidden">
              <div className="flex justify-center">
                <div className="flex gap-2 rounded-full border border-white/25 bg-white/15 backdrop-blur-md p-1 shadow-sm max-w-full">
                  {tabs.map((t) => {
                    const active = pathname === t.href;

                    return (
                      <button
                        key={t.href}
                        onClick={() => router.push(t.href)}
                        className={[
                          "rounded-full font-medium transition-all whitespace-nowrap",
                          // ✅ compacta en pantallas chicas para que entre mejor
                          "px-3 py-2 text-sm sm:px-4 md:px-5",
                          active
                            ? "bg-white text-slate-900"
                            : "text-white hover:bg-white/20 hover:backdrop-blur-sm",
                        ].join(" ")}
                        title={t.label}
                      >
                        {/* ✅ En xs usa short, desde sm usa full */}
                        <span className="sm:hidden">{t.short}</span>
                        <span className="hidden sm:inline">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Iconos derecha */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/dashboard/user/amigos"
              title="Amigos"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 hover:bg-white/25 hover:backdrop-blur-sm transition-all"
            >
              <Users className="h-4 w-4" />
            </a>

            <a
              href="/dashboard/user/configuracion"
              title="Configuración"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 hover:bg-white/25 hover:backdrop-blur-sm transition-all"
            >
              <Settings className="h-4 w-4" />
            </a>

            <a
              href="/dashboard/user/perfil"
              title="Perfil"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 hover:bg-white/25 hover:backdrop-blur-sm transition-all"
            >
              <User className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Contenido */}
        <div className="mt-10">{children}</div>
      </section>
    </div>
  );
}
