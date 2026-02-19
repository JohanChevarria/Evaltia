"use client";

type Props = {
  onGo: (id: string) => void;
  dirty: boolean;
  saving: boolean;
};

const items = [
  { id: "perfil", label: "Perfil" },
  { id: "planes", label: "Planes" },
  { id: "accesibilidad", label: "Accesibilidad" },
  { id: "privacidad", label: "Controles de privacidad" },
  { id: "amigos", label: "Amigos" },
];

export default function SettingsNav({ onGo, dirty, saving }: Props) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Secciones</p>
        <span className="text-xs text-white/70">
          {saving ? "Guardando..." : dirty ? "Sin guardar" : "Al día"}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onGo(it.id)}
            className="w-full rounded-2xl bg-white/5 px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10"
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
