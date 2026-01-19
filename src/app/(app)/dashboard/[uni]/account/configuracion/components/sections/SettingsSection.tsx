// src/app/(app)/dashboard/[uni]/account/configuracion/components/SettingsSection.tsx
"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  icon: LucideIcon;
  badge?: ReactNode;
  children: ReactNode;
};

export default function SettingsSection({ title, icon: Icon, badge, children }: Props) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
            <Icon className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>

        {badge ? <div>{badge}</div> : null}
      </div>

      {children}
    </section>
  );
}
