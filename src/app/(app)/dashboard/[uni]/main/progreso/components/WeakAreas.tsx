interface CourseArea {
  name: string;
  mastery: number;
}

interface WeakAreasProps {
  courses: CourseArea[];
}

export function WeakAreas({ courses }: WeakAreasProps) {
  const getColor = (m: number) => (m >= 75 ? "bg-emerald-500" : m >= 50 ? "bg-amber-500" : "bg-rose-500");
  const getText = (m: number) => (m >= 75 ? "text-emerald-700" : m >= 50 ? "text-amber-700" : "text-rose-700");
  const getLabel = (m: number) => (m >= 75 ? "Fuerte" : m >= 50 ? "Medio" : "Necesita enfoque");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-800 mb-1">Dominio por curso</h2>
        <p className="text-sm text-gray-600">Mide tu comprensión en diferentes materias</p>
      </div>

      <div className="space-y-4">
        {courses.map((c, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{c.name}</span>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${getText(c.mastery)}`}>{getLabel(c.mastery)}</span>
                <span className="text-gray-600 font-semibold w-12 text-right">{c.mastery}%</span>
              </div>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden">
              <div className={`h-full ${getColor(c.mastery)} transition-all duration-500 rounded-full`} style={{ width: `${c.mastery}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
