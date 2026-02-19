import { CreditCard, Clock } from "lucide-react";
import SettingsSection from "./SettingsSection";
import type { SettingsInitialData } from "../types";

export default function PlanSection({ plan }: { plan: SettingsInitialData["plan"] }) {
  return (
    <SettingsSection
      title="Planes"
      icon={CreditCard}
      badge={<span className="badge-demo">DEMO</span>}
    >
      <div className="bg-slate-50/60 rounded-lg p-5 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{plan.name || "Versión DEMO Gratuita"}</h3>
            <p className="text-sm text-slate-600 mt-1">
              Disfruta de acceso completo a la plataforma de evaluación
            </p>

            <div className="flex items-center gap-2 mt-3 text-sm">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-900 font-medium">
                Válida hasta el {plan.validUntil ?? "—"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-600/90 text-white rounded-lg font-medium transition-colors"
          onClick={() => (window.location.href = "/pricing")}
        >
          Explorar planes premium
        </button>
      </div>
    </SettingsSection>
  );
}
