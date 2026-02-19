"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditorClient({
  universityId,
}: {
  universityId: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel(`studio-realtime-${universityId}`)

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "concepts",
          filter: `university_id=eq.${universityId}`,
        },
        () => router.refresh()
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `university_id=eq.${universityId}`,
        },
        () => router.refresh()
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "options",
          filter: `university_id=eq.${universityId}`,
        },
        () => router.refresh()
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router, universityId]);

  return null;
}
