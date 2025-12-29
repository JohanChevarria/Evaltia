// src/app/(app)/nav/DashboardMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardMenu({
  basePath,
}: {
  basePath: string; // /dashboard/usmp/main
}) {
  const pathname = usePathname();

  const routes = [
    { label: "Inicio", href: `${basePath}` },
    { label: "Cursos", href: `${basePath}/cursos` },
    { label: "Progreso", href: `${basePath}/progreso` },
    { label: "Calendario", href: `${basePath}/calendario` },
    { label: "Clasificaciones", href: `${basePath}/clasificaciones` },
  ];

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 backdrop-blur-md px-2 py-2 shadow-sm">
      {routes.map((r) => {
        const isActive = pathname === r.href || pathname.startsWith(r.href + "/");
        return (
          <Link
            key={r.href}
            href={r.href}
            className={[
              "px-5 py-2 rounded-full text-sm font-medium transition",
              isActive ? "bg-white text-slate-900" : "text-white hover:bg-white/20",
            ].join(" ")}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}
