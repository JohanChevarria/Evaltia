"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pencil,
  BarChart2,
  History,
  Settings,
  LogOut,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function AdminSidebar({ collapsed }: Props) {
  const pathname = usePathname();

  // 📌 Detecta la universidad desde la URL: /studio/usmp/...
  const match = pathname.match(/^\/studio\/([^\/]+)/);
  const uniCode = match?.[1] ?? "usmp";

  const items = [
    { label: "Studio Dashboard", icon: LayoutDashboard, href: `/studio/${uniCode}` },
    { label: "Editor", icon: Pencil, href: `/studio/${uniCode}/editor` },
    { label: "Estadísticas", icon: BarChart2, href: `/studio/${uniCode}/stats` },
    { label: "Historial de cambios", icon: History, href: `/studio/${uniCode}/history` },
  ];

  return (
    <aside
      className={`shrink-0 flex flex-col border-r bg-white transition-all duration-300 shadow-sm
      ${collapsed ? "w-16" : "w-60"}
      h-full overflow-y-auto`}
    >
      {/* NAV PRINCIPAL */}
      <nav className="mt-3 px-2 space-y-1">
        {items.map(({ label, icon: Icon, href }) => {
          // 🔧 FIX: dashboard solo activo en /studio/usmp exacto
          const isDashboard = href === `/studio/${uniCode}`;
          const active = isDashboard
            ? pathname === href || pathname === `${href}/`
            : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition font-medium
                ${active ? "bg-[#3a506b] text-white" : "text-[#2c3e50] hover:bg-[#e2e8f0]"}
              `}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="mt-auto w-full px-2 pb-4 space-y-2">
        <Link
          href={`/studio/${uniCode}/settings`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#2c3e50] hover:bg-[#e2e8f0]"
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span>Configuración</span>}
        </Link>

        {/* ✅ Logout: HARD navigation para que route.ts borre cookies y redirija bien */}
        <a
          href={`/studio/${uniCode}/logout`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Cerrar sesión</span>}
        </a>
      </div>
    </aside>
  );
}
