// app/dashboard/main/page.tsx
export default function InicioPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Tarjeta 1 */}
      <div className="rounded-xl border border-white/20 p-6 shadow hover:shadow-lg transition bg-white/70 text-black">
        <h2 className="text-xl font-semibold mb-2">📝 Simulacros interactivos</h2>
        <p className="text-sm text-gray-700">
          Accede a preguntas alineadas a tu malla curricular y mide tu progreso.
        </p>
      </div>

      {/* Tarjeta 2 */}
      <div className="rounded-xl border border-white/20 p-6 shadow hover:shadow-lg transition bg-white/70 text-black">
        <h2 className="text-xl font-semibold mb-2">📆 Calendario de estudio</h2>
        <p className="text-sm text-gray-700">
          Organiza tus sesiones semanales y prioriza según tus metas.
        </p>
      </div>

      {/* Tarjeta 3 */}
      <div className="rounded-xl border border-white/20 p-6 shadow hover:shadow-lg transition bg-white/70 text-black">
        <h2 className="text-xl font-semibold mb-2">📊 Seguimiento de progreso</h2>
        <p className="text-sm text-gray-700">
          Revisa tus estadísticas generales y rendimiento por curso.
        </p>
      </div>
    </div>
  );
}