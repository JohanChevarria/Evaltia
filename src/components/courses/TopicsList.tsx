"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // 👈 2 niveles

type Topic = { id: string; name: string };

export default function TopicsList({ slug }: { slug: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("topics")
        .select("id, name")
        .eq("course_slug", slug)
        .order("name", { ascending: true });

      if (!alive) return;

      if (error) setError(error.message);
      else setTopics(data ?? []);

      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) return <div>Cargando…</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!topics.length) return <div>Sin temas aún.</div>;

  return (
    <ul className="space-y-1">
      {topics.map((t) => (
        <li key={t.id}>{t.name}</li>
      ))}
    </ul>
  );
}