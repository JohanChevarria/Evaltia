import { useEffect, useMemo, useState } from "react";

interface StudyDay {
  date: string;
  count: number;
}

interface StudyHeatmapProps {
  data: StudyDay[];
}

const START_YEAR = 2026;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data) {
      if (!row?.date) continue;
      map.set(row.date, row.count ?? 0);
    }
    return map;
  }, [data]);

  const maxDataYear = useMemo(() => {
    let max = START_YEAR;
    for (const row of data) {
      if (!row?.date) continue;
      const year = Number(row.date.slice(0, 4));
      if (Number.isFinite(year)) {
        max = Math.max(max, year);
      }
    }
    return max;
  }, [data]);

  const maxYear = Math.max(START_YEAR, maxDataYear, today.getFullYear());
  const [selectedYear, setSelectedYear] = useState(START_YEAR);

  useEffect(() => {
    setSelectedYear((prev) => Math.min(Math.max(prev, START_YEAR), maxYear));
  }, [maxYear]);

  const nextYear = selectedYear >= maxYear ? START_YEAR : selectedYear + 1;

  const days = useMemo(() => {
    const start = new Date(selectedYear, 0, 1);
    const end = new Date(selectedYear, 11, 31);
    const output: { date: Date; count: number; iso: string }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const current = new Date(d);
      const iso = toISODate(current);
      output.push({ date: current, iso, count: dataMap.get(iso) ?? 0 });
    }

    return output;
  }, [dataMap, selectedYear]);

  const weeks = useMemo(() => {
    const output: (typeof days)[] = [];
    let current: typeof days = [];

    for (let i = 0; i < days.length; i++) {
      current.push(days[i]);
      if (current.length === 7 || i === days.length - 1) {
        output.push(current);
        current = [];
      }
    }

    return output;
  }, [days]);

  const monthLabels = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthMarkers = useMemo(
    () =>
      weeks.map((week, index) => {
        if (!week.length) return "";
        const month = week[0].date.getMonth();
        if (index === 0) return monthLabels[month];

        const prevWeek = weeks[index - 1];
        const prevMonth = prevWeek?.length ? prevWeek[0].date.getMonth() : month;
        return month !== prevMonth ? monthLabels[month] : "";
      }),
    [weeks]
  );

  const daysForStreak = useMemo(() => {
    if (selectedYear !== today.getFullYear()) return days;
    return days.filter((day) => day.date <= today);
  }, [days, selectedYear, today]);

  let longestStreak = 0;
  let tmp = 0;
  for (const day of daysForStreak) {
    if (day.count > 0) {
      tmp += 1;
      longestStreak = Math.max(longestStreak, tmp);
    } else {
      tmp = 0;
    }
  }

  let currentStreak = 0;
  for (let i = daysForStreak.length - 1; i >= 0; i--) {
    if (daysForStreak[i].count > 0) currentStreak += 1;
    else break;
  }

  const maxDailyCount = days.reduce((max, day) => Math.max(max, day.count), 0);

  const getColor = (count: number) => {
    if (count <= 0 || maxDailyCount <= 0) return "bg-white/15";

    const ratio = count / maxDailyCount;
    if (ratio < 0.25) return "bg-emerald-200";
    if (ratio < 0.5) return "bg-emerald-300";
    if (ratio < 0.75) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-white mb-1">Tu progreso</h2>
          <p className="text-sm text-white/70">Heatmap anual desde 2026, iniciando siempre el 1 de enero</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-medium text-white/90">{selectedYear}</span>
          <button
            type="button"
            onClick={() => setSelectedYear(nextYear)}
            className="h-7 w-7 rounded-full border border-white/30 text-white/90 hover:bg-white/15 transition-colors text-sm"
            aria-label={`Ver ano ${nextYear}`}
            title={`Ver ano ${nextYear}`}
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="relative pb-1">
        <div className="w-full">
          <div className="flex gap-1 isolate">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 flex-1 min-w-0">
                {week.map((day, dayIndex) => {
                  const label = day.date.toLocaleDateString("es-PE", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={dayIndex}
                      className={`group relative z-0 w-full aspect-square rounded-sm ${getColor(day.count)} transition-all hover:ring-2 hover:ring-white hover:scale-110 hover:z-30 cursor-pointer`}
                    >
                      <div className="pointer-events-none absolute z-50 opacity-0 group-hover:opacity-100 transition-opacity -top-11 left-1/2 -translate-x-1/2">
                        <div className="px-3 py-2 bg-[#f2ead8]/95 text-slate-900 text-xs font-medium rounded-lg shadow-xl ring-1 ring-black/10 whitespace-nowrap">
                          {label}: {day.count} preguntas
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#f2ead8]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex gap-1 mt-2 text-xs text-white/60">
            {monthMarkers.map((label, index) => (
              <div key={`${label}-${index}`} className="flex-1 text-center">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 text-white/85">
        <div>
          <span className="text-sm">Racha mas larga: </span>
          <span className="font-semibold">{longestStreak} dias</span>
        </div>
        <div>
          <span className="text-sm">Racha actual: </span>
          <span className="font-semibold">{currentStreak} dias</span>
        </div>
      </div>
    </div>
  );
}
