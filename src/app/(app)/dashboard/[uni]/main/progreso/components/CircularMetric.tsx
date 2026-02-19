"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

interface MetricData {
  weekly: number;
  monthly: number;
  yearly: number;
}

interface CircularMetricProps {
  data: MetricData;
}

type Period = "weekly" | "monthly" | "yearly";

const ORDER: Period[] = ["weekly", "monthly", "yearly"];
const PERIOD_LABEL: Record<Period, string> = {
  weekly: "semana",
  monthly: "mes",
  yearly: "ano",
};

export function CircularMetric({ data }: CircularMetricProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");
  const x = useMotionValue(0);

  const pauseUntilRef = useRef<number>(0);

  const value = Math.max(0, data[selectedPeriod] ?? 0);

  const maxValue = useMemo(() => {
    const max = Math.max(data.weekly ?? 0, data.monthly ?? 0, data.yearly ?? 0);
    return max > 0 ? max : 1;
  }, [data.monthly, data.weekly, data.yearly]);

  const ringProgress = Math.min(1, value / maxValue);

  const radius = 86;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ringProgress);

  const setPeriodManual = (period: Period) => {
    setSelectedPeriod(period);
    pauseUntilRef.current = Date.now() + 30_000;
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;

      setSelectedPeriod((prev) => {
        const currentIndex = ORDER.indexOf(prev);
        return ORDER[(currentIndex + 1) % ORDER.length];
      });
    }, 10_000);

    return () => window.clearInterval(id);
  }, []);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > 50) {
      const direction = offset > 0 || velocity > 0 ? "right" : "left";
      const currentIndex = ORDER.indexOf(selectedPeriod);

      if (direction === "right") {
        setPeriodManual(ORDER[(currentIndex - 1 + ORDER.length) % ORDER.length]);
      } else {
        setPeriodManual(ORDER[(currentIndex + 1) % ORDER.length]);
      }
    }

    x.set(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="relative w-56 h-56 rounded-full cursor-grab active:cursor-grabbing select-none"
        >
          <div className="absolute inset-0 rounded-full bg-white/10 border border-white/20" />

          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={strokeWidth}
            />

            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#34d399"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-300"
            />
          </svg>

          <div className="absolute inset-[24px] rounded-full bg-emerald-50/90 border border-emerald-200/70 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
            <motion.div
              key={selectedPeriod}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="text-center px-2"
            >
              <div className="text-4xl font-semibold text-emerald-800 tabular-nums">
                {value.toLocaleString("es-PE")}
              </div>
              <div className="text-xs text-emerald-900/70 mt-1">
                preguntas en {PERIOD_LABEL[selectedPeriod]}
              </div>
              <div className="mt-2 text-[11px] text-emerald-900/50">Desliza o toca los puntos</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 justify-center">
        {ORDER.map((period) => (
          <button
            key={period}
            onClick={() => setPeriodManual(period)}
            className={`h-2 rounded-full transition-all ${
              selectedPeriod === period ? "bg-emerald-300 w-8" : "bg-white/35 w-2"
            }`}
            aria-label={`Cambiar a ${PERIOD_LABEL[period]}`}
            title={`Cambiar a ${PERIOD_LABEL[period]}`}
          />
        ))}
      </div>
    </div>
  );
}
