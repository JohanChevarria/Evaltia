"use client";

import { useMemo, useState } from "react";

type DayData = {
  questions?: number;
  correctPercent?: number;
  reminders?: string[];
};

type CalendarData = Record<string, DayData>;

// MOCK TEMPORAL: luego vendrá del backend
const MOCK_CALENDAR_DATA: CalendarData = {
  "2025-11-02": { questions: 40, correctPercent: 65 },
  "2025-11-05": { questions: 20, correctPercent: 80 },
  "2025-11-10": {
    reminders: ["Práctica personalizada: Histología"],
  },
  "2025-11-15": {
    questions: 60,
    correctPercent: 72,
    reminders: ["Simulacro ENAM"],
  },
  "2025-11-20": { questions: 30, correctPercent: 55 },
  "2025-11-25": {
    reminders: ["Repaso Embriología", "Práctica Anatomía"],
  },
};

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysMatrix(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1);

  let startWeekDay = firstDay.getDay(); // 0-6
  if (startWeekDay === 0) startWeekDay = 7; // domingo -> 7

  const matrix: { date: Date; isCurrentMonth: boolean }[][] = [];

  const startDate = new Date(year, monthIndex, 1 - (startWeekDay - 1));
  let current = new Date(startDate);

  // 6 filas de 7 días para mantener estructura
  for (let week = 0; week < 6; week++) {
    const row: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let day = 0; day < 7; day++) {
      const thisDate = new Date(current);
      row.push({
        date: thisDate,
        isCurrentMonth:
          thisDate.getMonth() === monthIndex &&
          thisDate.getFullYear() === year,
      });
      current.setDate(current.getDate() + 1);
    }
    matrix.push(row);
  }

  return matrix;
}

function formatKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function CalendarPage() {
  const today = new Date();
  const todayKey = formatKey(today);
  const todayStr = today.toISOString().slice(0, 10); // para min en <input type="date" />

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    today.getMonth()
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState(todayStr);
  const [reminderTitle, setReminderTitle] = useState("");

  const matrix = useMemo(
    () => getDaysMatrix(currentYear, currentMonthIndex),
    [currentYear, currentMonthIndex]
  );

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const handleOpenModal = () => {
    setReminderDate(todayStr);
    setReminderTitle("");
    setIsModalOpen(true);
  };

  const handleSaveReminder = () => {
    // Aquí luego iría la llamada al backend (Supabase / API).
    // Por ahora solo simulamos.
    console.log("Nuevo recordatorio:", {
      date: reminderDate,
      title: reminderTitle,
    });
    setIsModalOpen(false);
  };

  const title = `${MONTH_NAMES[currentMonthIndex]} ${currentYear}`;

  return (
    <main className="pb-6">
      <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-4 sm:p-5 text-slate-900 w-full">
        {/* Header + controles + botón recordatorio */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Calendario de estudio
            </p>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="mt-1 text-xs text-gray-500">
              Revisa lo que avanzaste y organiza tus próximos días de estudio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handlePrevMonth}
                className="px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold"
              >
                ← Mes anterior
              </button>
              <button
                onClick={handleNextMonth}
                className="px-3 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold"
              >
                Mes siguiente →
              </button>
            </div>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition mt-1 sm:mt-0"
            >
              Crear recordatorio de estudio
            </button>
          </div>
        </div>

        {/* Leyenda compacta */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-indigo-600" />
            Día actual
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" />
            Estudio registrado
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-200 border border-amber-300" />
            Recordatorio
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-50 border border-slate-100" />
            Otro mes
          </div>
        </div>

        {/* Grid mensual – ajustado para evitar scroll */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Encabezado de semana */}
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] sm:text-xs font-semibold text-gray-500 py-1"
            >
              {day}
            </div>
          ))}

          {/* Celdas de días */}
          {matrix.map((week, weekIndex) =>
            week.map(({ date, isCurrentMonth }, dayIndex) => {
              const key = formatKey(date);
              const data = isCurrentMonth ? MOCK_CALENDAR_DATA[key] : undefined;
              const isToday = key === todayKey && isCurrentMonth;

              const hasStudy = data?.questions && data.questions > 0;
              const hasReminder =
                data?.reminders && data.reminders.length > 0;

              let bgClass = isCurrentMonth ? "bg-white" : "bg-slate-50";
              if (hasStudy) bgClass = "bg-emerald-50";
              if (hasReminder) bgClass = "bg-amber-50";
              if (isToday) bgClass = "bg-indigo-600";

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-[76px] sm:min-h-[96px] rounded-xl border border-slate-100 px-2 py-1 flex flex-col ${bgClass}`}
                >
                  {/* número del día */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? "text-white"
                          : isCurrentMonth
                          ? "text-slate-900"
                          : "text-slate-300"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-semibold text-white">
                        Hoy
                      </span>
                    )}
                  </div>

                  {/* contenido */}
                  {isCurrentMonth ? (
                    <div className="flex-1 flex flex-col justify-between gap-1">
                      {hasStudy && (
                        <div>
                          <p
                            className={`text-[10px] ${
                              isToday ? "text-indigo-50" : "text-slate-700"
                            }`}
                          >
                            {data!.questions} preg.
                          </p>
                          {typeof data!.correctPercent === "number" && (
                            <p
                              className={`text-[10px] ${
                                isToday ? "text-emerald-100" : "text-emerald-700"
                              }`}
                            >
                              {data!.correctPercent}% correctas
                            </p>
                          )}
                        </div>
                      )}

                      {hasReminder && (
                        <div className="mt-1 space-y-0.5">
                          {data!.reminders!.slice(0, 2).map((rem, idx) => (
                            <p
                              key={idx}
                              className={`text-[10px] line-clamp-1 ${
                                isToday ? "text-amber-100" : "text-amber-700"
                              }`}
                            >
                              • {rem}
                            </p>
                          ))}
                          {data!.reminders!.length > 2 && (
                            <p
                              className={`text-[9px] ${
                                isToday ? "text-amber-100" : "text-amber-600"
                              }`}
                            >
                              +{data!.reminders!.length - 2} más
                            </p>
                          )}
                        </div>
                      )}

                      {!hasStudy && !hasReminder && (
                        <p
                          className={`text-[10px] ${
                            isToday ? "text-indigo-100" : "text-slate-300"
                          }`}
                        >
                          Sin registro
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Modal para crear recordatorio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Crear recordatorio de estudio
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Cerrar ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Solo puedes crear recordatorios para hoy o fechas futuras.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">
                  Fecha
                </label>
                <input
                  type="date"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  min={todayStr}
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-700">
                  Título del recordatorio
                </label>
                <input
                  type="text"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Ej: Práctica Histología, Simulacro ENAM..."
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 rounded-full text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveReminder}
                disabled={!reminderTitle}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                Guardar recordatorio
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}