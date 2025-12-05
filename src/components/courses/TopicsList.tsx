"use client";

import { useEffect, useState } from "react";
import supabase from "../../lib/supabase";
import { Info } from "lucide-react";

type Topic = {
  id: string;
  title: string;
  includes: string[] | null;
};

// Mapa: slug del curso -> id del curso en Supabase
const COURSE_IDS: Record<string, string> = {
  histologia: "459667d5-0e77-465f-adec-f48f3c6a7044",
  bioquimica: "0a7b7c26-e1fc-461c-aa4f-83a2c9dfacdc",
};

export default function TopicsList({ slug }: { slug: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const courseId = COURSE_IDS[slug];

      // Si no tenemos courseId para este slug → no hay temas configurados
      if (!courseId) {
        setTopics([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("topics")
        .select("id, title, includes, order_number")
        .eq("course_id", courseId)
        .order("order_number", { ascending: true });

      if (!alive) return;

      if (error) {
        console.error(error);
        setError(error.message);
        setTopics([]);
      } else {
        setTopics((data as Topic[]) || []);
      }

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) return <div>Cargando temas…</div>;
  if (error) return <div className="text-red-600 text-sm">Error: {error}</div>;
  if (!topics.length)
    return <div className="text-sm text-slate-700">Sin temas aún.</div>;

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <TopicRow key={topic.id} topic={topic} />
      ))}
    </div>
  );
}

function TopicRow({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">
          {topic.title}
        </span>

        {topic.includes && topic.includes.length > 0 && (
          <button
            type="button"
            className="p-1 hover:bg-gray-100 rounded-full"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <Info size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      {open && topic.includes && (
        <div className="absolute top-10 right-0 w-72 bg-white shadow-xl border border-gray-200 rounded-lg p-3 z-20 animate-fade">
          <h4 className="text-sm font-medium text-gray-800 mb-1">
            Incluye:
          </h4>
          <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
            {topic.includes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}