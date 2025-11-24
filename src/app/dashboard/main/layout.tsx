"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Users, Settings, User } from "lucide-react"; // 👈 ÍCONOS PERFECTOS

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { label: "Inicio", href: "/dashboard/main" },
    { label: "Cursos", href: "/dashboard/main/cursos" },
    { label: "Progreso", href: "/dashboard/main/progreso" },
    { label: "Calendario", href: "/dashboard/main/calendario" },
    { label: "Clasificaciones", href: "/dashboard/main/clasificaciones" },
  ];

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* Fondo personalizado tipo “moonlit fog” */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 30% 70%, rgba(176, 196, 222, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, 
              #2c3e50 0%,
              #3a506b 25%,
              #435e79 50%,
              #516b87 75%,
              #5f7995 100%
            )
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.05) contrast(1.05)",
        }}
      />

      <section className="relative font-mulish space-y-10 px-6 pt-8 max-w-7xl mx-auto z-10">
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between mb-8">
          {/* Logo + nombre */}
          <div className="flex items-center gap-2">
            <Image
              src="/evaltia-logo.png"
              alt="Evaltia"
              width={32}
              height={32}
            />
            <span className="font-semibold text-lg text-white">Evaltia</span>
          </div>

          {/* Menú centrado */}
          <div className="flex-1 flex justify-center">
            <div className="flex gap-2 border border-gray-300 rounded-full p-1 bg-white/20 backdrop-blur-md shadow-sm">
              {tabs.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium transition ${
                    pathname === item.href
                      ? "bg-white text-evaltia-dark"
                      : "text-white hover:bg-white/30"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* --------- Íconos con LOGOS PERFECTAMENTE CENTRADOS --------- */}
          <div className="flex items-center gap-4 text-white">
            {/* Amigos */}
            <a
              href="/dashboard/user/amigos"
              title="Amigos"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 hover:bg-white/20 transition"
            >
              <Users className="h-4 w-4" />
            </a>

            {/* Configuración */}
            <a
              href="/dashboard/user/configuracion"
              title="Configuración"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 hover:bg-white/20 transition"
            >
              <Settings className="h-4 w-4" />
            </a>

            {/* Perfil */}
            <a
              href="/dashboard/user/perfil"
              title="Perfil"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 hover:bg-white/20 transition"
            >
              <User className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* ---------- CONTENIDO DINÁMICO ---------- */}
        {children}
      </section>
    </div>
  );
}