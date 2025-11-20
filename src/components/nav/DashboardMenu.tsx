"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Define las rutas del menú central
const routes = [
  { label: "Inicio", href: "/dashboard" },
  { label: "Cursos", href: "/dashboard/cursos" },
  { label: "Progreso", href: "/dashboard/progreso" },
  { label: "Clasificaciones", href: "/dashboard/clasificaciones" },
  { label: "Calendario", href: "/dashboard/calendario" },
];

export function DashboardMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center w-full">
      <div className="flex gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
        {routes.map((route) => {
          const isActive = pathname === route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-full transition-all",
                isActive
                  ? "bg-black text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {route.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
