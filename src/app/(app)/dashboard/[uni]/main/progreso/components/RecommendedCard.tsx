"use client";

import { ArrowRight, Calendar, Target } from "lucide-react";

interface Recommendation {
  recommended: {
    subject: string;
    questionCount: number;
    reason: string;
  };
  scheduled: {
    subject: string;
    questionCount: number;
    time: string;
  };
}

interface RecommendedCardProps {
  recommendation: Recommendation;
}

export function RecommendedCard({ recommendation }: RecommendedCardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 mb-1">Plan de estudio de hoy</h2>
        <p className="text-sm text-gray-600">
          Basado en tus temas débiles y tu rendimiento reciente
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Target className="w-4 h-4" />
            <h3 className="font-medium">Recomendado</h3>
          </div>

          <div>
            <div className="text-gray-800 mb-2">
              Practica{" "}
              <span className="font-semibold text-indigo-600">
                {recommendation.recommended.questionCount} preguntas
              </span>{" "}
              de{" "}
              <span className="font-semibold text-indigo-600">
                {recommendation.recommended.subject}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {recommendation.recommended.reason}
            </p>
          </div>

          <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group">
            Iniciar práctica
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700">
            <Calendar className="w-4 h-4" />
            <h3 className="font-medium">Programado</h3>
          </div>

          <div>
            <div className="text-gray-800 mb-2">
              <span className="font-semibold text-emerald-600">
                {recommendation.scheduled.questionCount} preguntas
              </span>{" "}
              de{" "}
              <span className="font-semibold text-emerald-600">
                {recommendation.scheduled.subject}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Programado para {recommendation.scheduled.time}
            </p>
          </div>

          <button className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
            Ver agenda
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
