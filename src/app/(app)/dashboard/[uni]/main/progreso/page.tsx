"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import { StudyHeatmap } from "./components/StudyHeatmap";
import { CircularMetric } from "./components/CircularMetric";
import { FocusedCourses } from "./components/FocusedCourses";
import { RecommendedCard } from "./components/RecommendedCard";
import { PerformanceTrend } from "./components/PerformanceTrend";
import { WeakAreas } from "./components/WeakAreas";

type HeatmapDay = {
  date: string;
  count: number;
};

type MetricData = {
  weekly: number;
  monthly: number;
  yearly: number;
};

type AnswerRow = {
  created_at: string | null;
};

const HEATMAP_START_YEAR = 2026;
const HEATMAP_START_DATE_ISO = new Date(HEATMAP_START_YEAR, 0, 1).toISOString();

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function ProgresoPage() {
  const supabase = useMemo(() => createClient(), []);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [metricData, setMetricData] = useState<MetricData>({ weekly: 0, monthly: 0, yearly: 0 });
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      setActivityLoading(true);
      setActivityError(null);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (!cancelled) {
            setHeatmapData([]);
            setMetricData({ weekly: 0, monthly: 0, yearly: 0 });
          }
          return;
        }

        const today = startOfDay(new Date());
        const yearStart = new Date(today.getFullYear(), 0, 1);

        const monthStart = new Date(today);
        monthStart.setDate(monthStart.getDate() - 29);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 6);

        const { data: answerRows, error: answerError } = await supabase
          .from("exam_answers")
          .select("created_at")
          .gte("created_at", HEATMAP_START_DATE_ISO);

        if (answerError) throw answerError;

        const countsByDate = new Map<string, number>();
        let weekly = 0;
        let monthly = 0;
        let yearly = 0;

        for (const row of (answerRows ?? []) as AnswerRow[]) {
          if (!row?.created_at) continue;

          const answeredAt = new Date(row.created_at);
          if (Number.isNaN(answeredAt.getTime())) continue;

          const key = toISODate(answeredAt);
          countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1);

          if (answeredAt >= yearStart) yearly += 1;
          if (answeredAt >= monthStart) monthly += 1;
          if (answeredAt >= weekStart) weekly += 1;
        }

        const heatmap = Array.from(countsByDate.entries()).map(([date, count]) => ({
          date,
          count,
        }));

        if (!cancelled) {
          setHeatmapData(heatmap);
          setMetricData({ weekly, monthly, yearly });
        }
      } catch (error) {
        console.error("Progress activity load error:", error);
        if (!cancelled) {
          setHeatmapData([]);
          setMetricData({ weekly: 0, monthly: 0, yearly: 0 });
          setActivityError("No se pudo cargar la actividad reciente.");
        }
      } finally {
        if (!cancelled) {
          setActivityLoading(false);
        }
      }
    };

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const focusedCourses = useMemo(
    () => [
      {
        name: "Fisiologia Renal",
        totalQuestions: 89,
        correctAnswers: 52,
        incorrectAnswers: 37,
        weakTopic: "TFG, depuracion y conceptos de aclaramiento",
      },
      {
        name: "Fisiologia Cardiovascular",
        totalQuestions: 102,
        correctAnswers: 87,
        incorrectAnswers: 15,
        weakTopic: "Regulacion del gasto cardiaco",
      },
      {
        name: "Farmacologia",
        totalQuestions: 76,
        correctAnswers: 48,
        incorrectAnswers: 28,
        weakTopic: "Farmacos del sistema nervioso autonomo",
      },
    ],
    []
  );

  const recommendation = useMemo(
    () => ({
      recommended: {
        subject: "Fisiologia Renal",
        questionCount: 15,
        reason:
          "Tienes 42% de aciertos en temas de filtracion glomerular. Practicar enfocado te ayudara antes del examen.",
      },
      scheduled: {
        subject: "Fisiologia Cardiovascular",
        questionCount: 20,
        time: "hoy a las 4:00 p. m.",
      },
    }),
    []
  );

  const performanceData = useMemo(
    () => [
      { day: "Lun", currentWeek: 32, previousWeek: 28 },
      { day: "Mar", currentWeek: 45, previousWeek: 34 },
      { day: "Mie", currentWeek: 38, previousWeek: 42 },
      { day: "Jue", currentWeek: 52, previousWeek: 31 },
      { day: "Vie", currentWeek: 41, previousWeek: 38 },
      { day: "Sab", currentWeek: 29, previousWeek: 24 },
      { day: "Dom", currentWeek: 35, previousWeek: 30 },
    ],
    []
  );

  const mastery = useMemo(
    () => [
      { name: "Fisiologia Renal", mastery: 42 },
      { name: "Fisiologia Cardiovascular", mastery: 78 },
      { name: "Farmacologia", mastery: 56 },
    ],
    []
  );

  return (
    <div className="px-6 py-5">
      <div className="mb-4">
        <h1 className="text-white text-2xl font-semibold">Progreso</h1>
        <p className="text-white/70 text-sm">
          Visualiza tu constancia, tendencias y recomendaciones de estudio.
        </p>
      </div>

      <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-6 pb-6 pt-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px] gap-6 items-start">
          <div className="min-w-0">
            <StudyHeatmap data={heatmapData} />
          </div>

          <div className="xl:-mt-1">
            <CircularMetric data={metricData} />
            <div className="mt-3 min-h-5 text-xs text-white/60 text-center">
              {activityLoading
                ? "Actualizando actividad..."
                : activityError
                  ? activityError
                  : metricData.yearly === 0
                    ? "Aun no tienes respuestas registradas."
                    : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
          <FocusedCourses courses={focusedCourses} />
        </div>

        <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
          <RecommendedCard recommendation={recommendation} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
          <PerformanceTrend data={performanceData} />
        </div>

        <div className="rounded-2xl bg-white/70 border border-white/40 p-6">
          <WeakAreas courses={mastery} />
        </div>
      </div>
    </div>
  );
}
