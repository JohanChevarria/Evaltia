export const dynamic = "force-dynamic";

export default function StudioHome({ params }: { params: { uni: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Evaltia Studio — {params.uni.toUpperCase()}</h1>
      <p className="text-gray-600">
        Panel de administración (multi-universidad por URL).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-sm">Estado del banco</h2>
          <p className="text-xs text-gray-500">Resumen general.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-sm">Progreso de edición</h2>
          <p className="text-xs text-gray-500">Pronto gráfico.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-sm">Actividad reciente</h2>
          <p className="text-xs text-gray-500">Últimos cambios del admin.</p>
        </div>
      </div>
    </div>
  );
}
