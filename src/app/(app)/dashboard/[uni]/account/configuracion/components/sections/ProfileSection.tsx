"use client";

import { User, Lock, Calendar } from "lucide-react";
import SettingsSection from "./SettingsSection";
import type { SettingsInitialData, Gender } from "../types";

type Profile = SettingsInitialData["profile"];
type Props = { value: Profile; onChange: (next: Profile) => void };

export default function ProfileSection({ value, onChange }: Props) {
  return (
    <SettingsSection title="Perfil" icon={User}>
      <div className="space-y-5">
        <div>
          <label className="settings-label">
            <Lock className="inline w-3.5 h-3.5 mr-1 opacity-60" />
            Nombre de usuario
          </label>
          <input type="text" value={value.username} disabled className="settings-input" />
          <p className="text-xs text-slate-500 mt-1">
            El nombre de usuario no se puede cambiar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="settings-label">Nombre</label>
            <input
              type="text"
              value={value.firstName}
              onChange={(e) => onChange({ ...value, firstName: e.target.value })}
              className="settings-input"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="settings-label">Apellido paterno y materno</label>
            <input
              type="text"
              value={value.lastName}
              onChange={(e) => onChange({ ...value, lastName: e.target.value })}
              className="settings-input"
              placeholder="Tus apellidos"
            />
          </div>
        </div>

        <div>
          <label className="settings-label">Género</label>
          <select
            value={value.gender}
            onChange={(e) => onChange({ ...value, gender: e.target.value as Gender })}
            className="settings-input cursor-pointer"
          >
            <option value="unspecified">No especificado</option>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label className="settings-label">
            <Calendar className="inline w-3.5 h-3.5 mr-1 opacity-60" />
            Fecha de nacimiento
          </label>
          <input
            type="date"
            value={value.birthdate ?? ""}
            onChange={(e) => onChange({ ...value, birthdate: e.target.value || null })}
            className="settings-input"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            onClick={() => (window.location.href = "/auth/recover")}
          >
            <Lock className="w-4 h-4" />
            Cambiar contraseña
          </button>
          <p className="text-xs text-slate-500 mt-1.5">
            Serás redirigido a recuperación de contraseña
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
