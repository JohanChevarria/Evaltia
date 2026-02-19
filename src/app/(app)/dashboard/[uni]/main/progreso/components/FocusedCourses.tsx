import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface CourseStats {
  name: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  weakTopic: string;
}

interface FocusedCoursesProps {
  courses: CourseStats[];
}

export function FocusedCourses({ courses }: FocusedCoursesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 mb-1">Reporte semanal</h2>
        <p className="text-sm text-gray-600">
          Resumen de tus 3 cursos enfocados esta semana
        </p>
      </div>

      <div className="space-y-5">
        {courses.map((course, index) => (
          <div key={index} className="space-y-3">
            <h3 className="text-gray-800 font-medium">{course.name}</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3">
                <div className="text-2xl font-semibold text-indigo-600">
                  {course.totalQuestions}
                </div>
                <div className="text-xs text-gray-600 mt-1">Total</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div className="text-2xl font-semibold text-emerald-600">
                    {course.correctAnswers}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">Correctas</div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <div className="text-2xl font-semibold text-rose-600">
                    {course.incorrectAnswers}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">Incorrectas</div>
              </div>
            </div>

            <button className="w-full flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 hover:bg-amber-100 transition-colors text-left group">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-700">
                  <span className="font-medium text-amber-700">
                    Necesita refuerzo:
                  </span>{" "}
                  <span className="underline decoration-dotted group-hover:decoration-solid">
                    {course.weakTopic}
                  </span>
                </div>
              </div>
            </button>

            {index < courses.length - 1 && (
              <div className="border-t border-gray-200 pt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
