"use client";

interface PerformanceData {
  day: string;
  currentWeek: number;
  previousWeek: number;
}

interface PerformanceTrendProps {
  data: PerformanceData[];
}

export function PerformanceTrend({ data }: PerformanceTrendProps) {
  const max = Math.max(
    1,
    ...data.flatMap((d) => [d.currentWeek, d.previousWeek])
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 mb-1">Tendencia de rendimiento</h2>
        <p className="text-sm text-gray-600">
          Compara tu progreso diario con la semana anterior
        </p>
      </div>

      <div className="bg-white/30 rounded-xl p-6">
        <div className="grid grid-cols-7 gap-3 items-end h-40">
          {data.map((d) => {
            const hPrev = Math.round((d.previousWeek / max) * 100);
            const hCurr = Math.round((d.currentWeek / max) * 100);

            return (
              <div key={d.day} className="flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div
                    className="w-2 rounded bg-slate-400/70"
                    style={{ height: `${hPrev}%` }}
                    title={`Semana anterior: ${d.previousWeek}`}
                  />
                  <div
                    className="w-2 rounded bg-indigo-500/80"
                    style={{ height: `${hCurr}%` }}
                    title={`Semana actual: ${d.currentWeek}`}
                  />
                </div>
                <div className="text-xs text-gray-600">{d.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-slate-400 rounded" />
          <span className="text-gray-600">Semana anterior</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-indigo-500 rounded" />
          <span className="text-gray-600">Semana actual</span>
        </div>
      </div>
    </div>
  );
}
