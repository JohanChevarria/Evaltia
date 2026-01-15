"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({
  children,
  university,
  userName,
}: {
  children: React.ReactNode;
  university: { shortName: string };
  userName: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fb] overflow-hidden">
      {/* Topbar fijo (no scrollea) */}
      <div className="shrink-0">
        <AdminTopbar
          university={university}
          userName={userName}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Body: ocupa el resto del viewport */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar: fijo en pantalla (no scrollea con el main) */}
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        {/* Main: ÚNICO que scrollea */}
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
