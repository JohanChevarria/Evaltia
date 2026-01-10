type StartReviewArgs = {
  topicId: string;
  topicName: string;
  courseId?: string;
  universityId?: string;
};

export async function startReview({ topicId, topicName, courseId, universityId }: StartReviewArgs) {
  const res = await fetch("/exams/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "repaso",
      topic_id: topicId,
      topic_name: topicName,
      course_id: courseId,
      university_id: universityId,
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error ?? "No se pudo crear la sesi\u00f3n de repaso.";
    throw new Error(msg);
  }

  const sessionId = data?.sessionId ?? data?.id;
  if (!sessionId) {
    throw new Error("No se obtuvo el sessionId.");
  }

  return sessionId as string;
}
