export default function AdminStudioDashboardPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Admin Studio dashboard</h1>
        <p className="text-gray-600">
          Resumen del banco de preguntas y actividad de la universidad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-sm">
            Estado de bancos por curso
          </h2>
          <p className="text-xs text-gray-500">
            Aquí luego mostraremos algo tipo barras / progreso.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-sm">
            Progreso de edición
          </h2>
          <p className="text-xs text-gray-500">
            % de temas con bancos completos, pendientes, etc.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-2 text-sm">
            Últimos usuarios / eventos
          </h2>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Admin A creó 10 preguntas</li>
            <li>• Admin B editó Histología</li>
            <li>• Admin C actualizó tags de dificultad</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
