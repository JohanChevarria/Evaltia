"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { shuffleWithSeed } from "../lib/shuffle";
import { buildMatchingExamOptions } from "../lib/matchingOptions";
import type {
  ExamAnswer,
  ExamMode,
  ExamNote,
  ExamOption,
  ExamQuestion,
  ExamSession,
  SessionPayload,
} from "../lib/types";
import { LeftPanel } from "./components/LeftPanel";
import { RightControls } from "./components/RightControls";
import { QuestionArea } from "./components/QuestionArea";

type Props = {
  payload: SessionPayload;
};

type PendingAnswer = {
  tempId: string;
  uiLabel: string;
};

const UI_LABELS = ["A", "B", "C", "D", "E"] as const;
const DEFAULT_UNI_CODE = "usmp";

function uiIndexFromLabel(uiLabel: string) {
  const idx = UI_LABELS.indexOf(uiLabel as any);
  return idx >= 0 ? idx : -1;
}

function buildAnswerMap(answers: ExamAnswer[]) {
  const map = new Map<string, ExamAnswer[]>();
  for (const ans of answers) {
    const list = map.get(ans.question_id) ?? [];
    list.push(ans);
    list.sort((a, b) => (a.attempt ?? 0) - (b.attempt ?? 0));
    map.set(ans.question_id, list);
  }
  return map;
}

function buildNoteMap(notes: ExamNote[]) {
  const map = new Map<string, ExamNote>();
  for (const note of notes) {
    if (note.question_id) map.set(note.question_id, note);
  }
  return map;
}

function getLatestAnswer(map: Map<string, ExamAnswer[]>, questionId: string) {
  const list = map.get(questionId) ?? [];
  if (!list.length) return null;
  return list[list.length - 1];
}

function getFirstAnswer(map: Map<string, ExamAnswer[]>, questionId: string) {
  const list = map.get(questionId) ?? [];
  if (!list.length) return null;
  return list[0];
}

function initialTimeLeft(session: ExamSession): number | null {
  if (!session.timed || !session.time_limit_minutes) return null;

  const limitSeconds = Math.max(1, session.time_limit_minutes * 60);
  const createdAt = session.created_at ? Date.parse(session.created_at) : Date.now();
  const elapsed = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
  return Math.max(limitSeconds - elapsed, 0);
}

export default function ExamSolveClient({ payload }: Props) {
  const router = useRouter();
  const { session, questions, answers, notes } = payload;

  const orderedQuestions: ExamQuestion[] = useMemo(() => {
    return [...questions].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.min(
      Math.max(session.current_index ?? 0, 0),
      Math.max(orderedQuestions.length - 1, 0)
    )
  );

  const [answersByQuestion, setAnswersByQuestion] = useState<Map<string, ExamAnswer[]>>(() =>
    buildAnswerMap(answers)
  );
  const [notesByQuestion, setNotesByQuestion] = useState<Map<string, ExamNote>>(() =>
    buildNoteMap(notes)
  );

  const [flagged, setFlagged] = useState<Set<string>>(new Set(session.flagged_question_ids ?? []));
  const [strikeState, setStrikeState] = useState<Record<string, Set<string>>>({});
  const initialFinished = !!session.finished_at || session.status === "finished";
  const [finished, setFinished] = useState<boolean>(initialFinished);
  const [finishing, setFinishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [courseContext, setCourseContext] = useState<{ courseId: string | null; uniCode: string | null }>({
    courseId: null,
    uniCode: null,
  });

  const [showExitOverlay, setShowExitOverlay] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [closing, setClosing] = useState(false);

  const [pendingByQuestion, setPendingByQuestion] = useState<Map<string, PendingAnswer>>(
    new Map()
  );

  const finishPostedRef = useRef<boolean>(initialFinished);
  const queuedSelectionRef = useRef<Map<string, string>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number | null>(() => initialTimeLeft(session));

  const optionsByQuestion = useMemo(() => {
    const pickFive = (opts: ExamOption[], seedLocal: string): ExamOption[] => {
      const shuffledAll = shuffleWithSeed(opts, `${seedLocal}-all`);

      const corrects = shuffledAll.filter((o) => !!o.is_correct);
      const incorrects = shuffledAll.filter((o) => !o.is_correct);

      const chosenCorrect = corrects.length
        ? shuffleWithSeed(corrects, `${seedLocal}-c`)[0]
        : null;

      const chosenIncorrects = shuffleWithSeed(incorrects, `${seedLocal}-i`).slice(0, 4);

      let picked: ExamOption[] = [];
      if (chosenCorrect) picked.push(chosenCorrect);
      picked.push(...chosenIncorrects);

      if (picked.length < 5) {
        const rest = shuffledAll.filter(
          (o) =>
            !picked.some((p) =>
              p.id && o.id ? p.id === o.id : (p.label ?? "") === (o.label ?? "")
            )
        );
        picked = [...picked, ...rest.slice(0, 5 - picked.length)];
      }

      if (chosenCorrect) {
        picked = picked.map((o) => ({
          ...o,
          is_correct:
            (o.id && chosenCorrect.id && o.id === chosenCorrect.id) ||
            (!o.id &&
              (o.label ?? "").toUpperCase() === (chosenCorrect.label ?? "").toUpperCase()),
        }));
      }

      return shuffleWithSeed(picked, `${seedLocal}-final`).slice(0, 5);
    };

    const map = new Map<string, ExamOption[]>();

    for (const q of orderedQuestions) {
      const isMatching = (q.question_type ?? "").toString().toLowerCase() === "matching";
      if (isMatching) {
        map.set(
          q.id,
          buildMatchingExamOptions({
            sessionId: session.id,
            questionId: q.id,
            matching_key: q.matching_key,
          })
        );
        continue;
      }
      const seedLocal = `${session.id}-${q.id}`;
      const safe = pickFive(q.options ?? [], seedLocal);
      map.set(q.id, safe);
    }

    return map;
  }, [orderedQuestions, session.id]);

  const primaryCourseId = session.course_id ?? orderedQuestions[0]?.course_id ?? null;
  const primaryUniversityId = session.university_id ?? orderedQuestions[0]?.university_id ?? null;

  useEffect(() => {
    let active = true;
    if (!primaryCourseId && !primaryUniversityId) return;

    const resolveContext = async () => {
      let uniCode = courseContext.uniCode;
      if (!uniCode && primaryUniversityId) {
        const supabase = createClient();
        const { data } = await supabase
          .from("universities")
          .select("code")
          .eq("id", primaryUniversityId)
          .single();
        uniCode = (data?.code || DEFAULT_UNI_CODE).toLowerCase();
      }

      if (!active) return;

      setCourseContext((prev) => {
        const nextCourseId = primaryCourseId ?? prev.courseId ?? null;
        const nextUniCode = uniCode ?? prev.uniCode ?? null;
        if (prev.courseId === nextCourseId && prev.uniCode === nextUniCode) return prev;
        return { courseId: nextCourseId, uniCode: nextUniCode };
      });

      if (primaryCourseId && uniCode) {
        router.prefetch(`/dashboard/${uniCode}/main/cursos/${primaryCourseId}`);
      }
    };

    void resolveContext();

    return () => {
      active = false;
    };
  }, [primaryCourseId, primaryUniversityId, courseContext.uniCode, router]);

  useEffect(() => {
    if (!session.timed || finished || timeLeft === null) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return prev;
        const next = Math.max(prev - 1, 0);
        if (next === 0 && !finishPostedRef.current) {
          finishPostedRef.current = true;
          void finishSession(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.timed, finished, timeLeft]);

  const currentQuestion = orderedQuestions[currentIndex] ?? null;
  const currentQuestionId = currentQuestion?.id ?? null;
  const currentOptions = currentQuestionId
    ? optionsByQuestion.get(currentQuestionId) ?? currentQuestion?.options ?? []
    : [];

  const pendingUi = currentQuestionId ? pendingByQuestion.get(currentQuestionId) ?? null : null;
  const latestReal = currentQuestionId ? getLatestAnswer(answersByQuestion, currentQuestionId) : null;
  const isPending = !!pendingUi;


  const selectedUiLabel: string | null = useMemo(() => {
    if (pendingUi?.uiLabel) return pendingUi.uiLabel;
    if (!latestReal) return null;

    const real = (latestReal.selected_option_label ?? "").toString();
    const idx = currentOptions.findIndex((o) => (o.label ?? "").toString() === real);
    if (idx < 0) return null;

    return UI_LABELS[idx] ?? null;
  }, [pendingUi, latestReal, currentOptions]);

  const striked = currentQuestionId ? strikeState[currentQuestionId] ?? new Set<string>() : new Set<string>();

  const mode = session.mode as ExamMode;
  const modeLabel = mode === "simulacro" ? "Simulacro" : mode === "repaso" ? "Repaso" : "Practica";

  useEffect(() => {
    if (mode !== "practica") return;
    if (session.status !== "paused") return;
    let active = true;

    const resumePractice = async () => {
      try {
        await fetch(`/exams/api/sessions/${session.id}/resume`, { method: "POST" });
      } catch (err: any) {
        if (active) {
          setActionError(err?.message ?? "No se pudo reanudar la practica.");
        }
      }
    };

    void resumePractice();

    return () => {
      active = false;
    };
  }, [mode, session.status, session.id]);

  const reviewState = useMemo(() => {
    if (mode !== "repaso") {
      return { incorrect: new Set<string>(), correctLabel: null as string | null };
    }

    if (!currentQuestionId) {
      return { incorrect: new Set<string>(), correctLabel: null as string | null };
    }

    const answerList = answersByQuestion.get(currentQuestionId) ?? [];
    if (!answerList.length) {
      return { incorrect: new Set<string>(), correctLabel: null as string | null };
    }

    const labelMap = new Map<string, string>();
    currentOptions.forEach((opt, idx) => {
      const key = (opt.label ?? "").toString().trim().toUpperCase();
      if (!key) return;
      labelMap.set(key, UI_LABELS[idx] ?? String(idx + 1));
    });

    const incorrect = new Set<string>();
    let correctLabel: string | null = null;

    for (const ans of answerList) {
      const key = (ans.selected_option_label ?? "").toString().trim().toUpperCase();
      const uiLabel = labelMap.get(key);
      if (!uiLabel) continue;
      if (ans.is_correct) correctLabel = uiLabel;
      else incorrect.add(uiLabel);
    }

    return { incorrect, correctLabel };
  }, [mode, answersByQuestion, currentQuestionId, currentOptions]);

  const reviewIncorrectLabels = mode === "repaso" ? reviewState.incorrect : undefined;
  const reviewCorrectLabel = mode === "repaso" ? reviewState.correctLabel : null;

  const isAnswerCorrect = latestReal?.is_correct ?? false;

  const hardLocked = finished || (mode === "repaso" ? !!latestReal?.is_correct : !!latestReal);

  const showFeedback = mode === "simulacro" ? finished : !!latestReal;
  const showExplanation = mode === "simulacro" ? finished : !!latestReal;

  const showTimer = !finished && mode !== "repaso" && session.timed && timeLeft !== null;

  const answeredByQuestion = useMemo(() => {
    const map = new Map<string, { answered: boolean; correct: boolean }>();
    orderedQuestions.forEach((q) => {
      const first = getFirstAnswer(answersByQuestion, q.id);
      const last = getLatestAnswer(answersByQuestion, q.id);
      const base = mode === "repaso" ? first : last;
      map.set(q.id, { answered: !!base, correct: !!base?.is_correct });
    });
    return map;
  }, [orderedQuestions, answersByQuestion, mode]);

  const questionNavItems = orderedQuestions.map((q, idx) => {
    const state = answeredByQuestion.get(q.id) ?? { answered: false, correct: false };
    return {
      id: q.id,
      label: idx + 1,
      answered: state.answered,
      correct: state.correct,
      flagged: flagged.has(q.id),
    };
  });

  const handleToggleStrike = (uiLabel: string) => {
    if (!currentQuestionId) return;
    setStrikeState((prev) => {
      const next = { ...prev };
      const set = new Set(next[currentQuestionId] ?? []);
      if (set.has(uiLabel)) set.delete(uiLabel);
      else set.add(uiLabel);
      next[currentQuestionId] = set;
      return next;
    });
  };

  const handleSelectOption = async (uiLabel: string) => {
    if (!currentQuestionId) return;
    if (finished) return;
    if (hardLocked) return;
    if (striked.has(uiLabel)) return;

    setActionError(null);
    if (isPending) {
      if (mode === "repaso") {
        queuedSelectionRef.current.set(currentQuestionId, uiLabel);
      }
      return;
    }

    const idx = uiIndexFromLabel(uiLabel);
    const chosen = idx >= 0 ? currentOptions[idx] : null;
    if (!chosen) {
      setActionError("No se encontró la opción seleccionada.");
      return;
    }

    const realOptionLabel = (chosen.label ?? "").toString();
    if (!realOptionLabel) {
      setActionError("La opción no tiene label real para guardarse.");
      return;
    }

    const optimisticId = `temp-${currentQuestionId}-${Date.now()}`;
    const optimisticAttempt = (latestReal?.attempt ?? 0) + 1;
    const optimisticAnswer: ExamAnswer = {
      id: optimisticId,
      session_id: session.id,
      question_id: currentQuestionId,
      selected_option_label: realOptionLabel,
      is_correct: !!chosen.is_correct,
      attempt: optimisticAttempt,
      created_at: new Date().toISOString(),
    };

    setAnswersByQuestion((prev) => {
      const next = new Map(prev);
      const list = [...(next.get(currentQuestionId) ?? [])];
      list.push(optimisticAnswer);
      next.set(currentQuestionId, list);
      return next;
    });

    setPendingByQuestion((prev) => {
      const next = new Map(prev);
      next.set(currentQuestionId, { tempId: optimisticId, uiLabel });
      return next;
    });

    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestionId,
          optionLabel: realOptionLabel,
          currentIndex,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error ?? "No se pudo guardar la respuesta.";
        throw new Error(msg);
      }

      if (data?.locked) {
        throw new Error("Esta pregunta ya fue respondida.");
      }

      setAnswersByQuestion((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(currentQuestionId) ?? [])];
        const idx = list.findIndex((item) => item.id === optimisticId);
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            id: data?.answerId ?? list[idx].id,
            is_correct: typeof data?.isCorrect === "boolean" ? data.isCorrect : list[idx].is_correct,
            attempt: typeof data?.attempt === "number" ? data.attempt : list[idx].attempt,
          };
        }
        next.set(currentQuestionId, list);
        return next;
      });

      setPendingByQuestion((prev) => {
        const next = new Map(prev);
        next.delete(currentQuestionId);
        return next;
      });
    } catch (err: any) {
      setAnswersByQuestion((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(currentQuestionId) ?? [])].filter(
          (item) => item.id !== optimisticId
        );
        next.set(currentQuestionId, list);
        return next;
      });

      setPendingByQuestion((prev) => {
        const next = new Map(prev);
        next.delete(currentQuestionId);
        return next;
      });
      setActionError(err?.message ?? "Error guardando la respuesta.");
    }
  };

  const handleResetMarks = () => {
    if (!currentQuestionId) return;
    setStrikeState((prev) => {
      const next = { ...prev };
      if (!next[currentQuestionId] || next[currentQuestionId].size === 0) return prev;
      next[currentQuestionId] = new Set();
      return next;
    });
  };

  useEffect(() => {
    const questionId = currentQuestionId;
    if (!questionId || finished || isPending) return;
    const queued = queuedSelectionRef.current.get(questionId);
    if (!queued) return;
    queuedSelectionRef.current.delete(questionId);
    void handleSelectOption(queued);
  }, [currentQuestionId, finished, isPending, handleSelectOption]);

  const handleToggleFlag = async () => {
    if (!currentQuestionId) return;
    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestionId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error ?? "No se pudo actualizar la marca.";
        throw new Error(msg);
      }

      const list: string[] = data?.flagged ?? [];
      setFlagged(new Set(list));
    } catch (err: any) {
      setActionError(err?.message ?? "No se pudo marcar la pregunta.");
    }
  };

  const handleSaveNote = async (text: string) => {
    if (!currentQuestionId) return;
    setSavingNoteId(currentQuestionId);
    setActionError(null);
    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestionId, text }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error ?? "No se pudo guardar la nota.";
        throw new Error(msg);
      }

      if (data?.note) {
        const note: ExamNote = {
          id: data.note.id,
          session_id: session.id,
          question_id: currentQuestionId,
          text: data.note.text,
          updated_at: data.note.updated_at,
        };
        setNotesByQuestion((prev) => {
          const next = new Map(prev);
          next.set(currentQuestionId, note);
          return next;
        });
      } else if (text.trim().length === 0) {
        setNotesByQuestion((prev) => {
          const next = new Map(prev);
          next.delete(currentQuestionId);
          return next;
        });
      }
    } catch (err: any) {
      setActionError(err?.message ?? "No se pudo guardar la nota.");
      throw err;
    } finally {
      setSavingNoteId(null);
    }
  };

  const resolveCourseRedirect = async () => {
    const courseId = primaryCourseId ?? courseContext.courseId;
    if (!courseId) return null;

    let uniCode = courseContext.uniCode;
    if (!uniCode && primaryUniversityId) {
      const supabase = createClient();
      const { data } = await supabase
        .from("universities")
        .select("code")
        .eq("id", primaryUniversityId)
        .single();
      uniCode = (data?.code || DEFAULT_UNI_CODE).toLowerCase();
      setCourseContext((prev) => ({
        courseId: courseId ?? prev.courseId ?? null,
        uniCode: uniCode ?? prev.uniCode ?? null,
      }));
    }

    if (!uniCode) return null;
    return `/dashboard/${uniCode}/main/cursos/${courseId}`;
  };

  const finishSession = async (auto?: boolean) => {
    if (finished || finishing) return;
    setFinishing(true);
    finishPostedRef.current = true;
    try {
      await fetch(`/exams/api/sessions/${session.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentIndex }),
      });
      setFinished(true);

      if (!auto) {
        const redirectTo = await resolveCourseRedirect();
        router.push(redirectTo ?? "/exams");
      }
    } catch (err: any) {
      if (!auto) setActionError(err?.message ?? "No se pudo cerrar la sesión.");
    } finally {
      setFinishing(false);
    }
  };

  const saveProgressAndExit = async () => {
    if (closing) return;
    setClosing(true);
    try {
      await fetch(`/exams/api/sessions/${session.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentIndex }),
      });
    } catch {
      /* best-effort */
    }

    const redirectTo = await resolveCourseRedirect();
    router.push(redirectTo ?? "/exams");
  };

  const pausePracticeSession = async () => {
    if (pausing) return;
    setPausing(true);
    setActionError(null);
    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentIndex }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error ?? "No se pudo pausar la practica.";
        throw new Error(msg);
      }

      setShowExitOverlay(false);
      const redirectTo = await resolveCourseRedirect();
      router.push(redirectTo ?? "/exams");
    } catch (err: any) {
      setActionError(err?.message ?? "No se pudo pausar la practica.");
    } finally {
      setPausing(false);
    }
  };

  const handleClose = async () => {
    if (mode === "practica" && !finished) {
      setShowExitOverlay(true);
      return;
    }
    await saveProgressAndExit();
  };

  const handleFeedback = () => {
    setActionError("Envia tu comentario a soporte@evaltia.com mientras activamos el canal de feedback.");
  };

  const navigateTo = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), orderedQuestions.length - 1);
    setCurrentIndex(clamped);
    setActionError(null);
  };

  if (!currentQuestion) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="rounded-2xl bg-white/80 border border-black/5 shadow-lg p-6 text-slate-800">
          No hay preguntas en esta sesiИn.
        </div>
      </div>
    );
  }

  const currentNote = notesByQuestion.get(currentQuestion.id)?.text ?? "";

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase text-slate-200 font-semibold">Examen</p>
            <h1 className="text-2xl font-bold text-white drop-shadow-sm break-words max-w-[56rem]">
              {session.name || "Examen"}
            </h1>
          </div>

          <RightControls
            flagged={flagged.has(currentQuestion.id)}
            onToggleFlag={handleToggleFlag}
            onFeedback={handleFeedback}
            onClose={handleClose}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px,minmax(0,1fr)] gap-4 lg:gap-6">
          <div className="min-w-0">
            <LeftPanel
              sessionName={session.name || "Examen"}
              modeLabel={modeLabel}
              showTimer={showTimer}
              timeLeft={timeLeft}
              items={questionNavItems}
              currentIndex={currentIndex}
              onSelect={navigateTo}
            />
          </div>

          <div className="min-w-0 space-y-4">
            <div className="rounded-2xl bg-white/90 border border-black/5 shadow-lg p-4 sm:p-5 lg:p-6 space-y-4">
              {actionError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-3 py-2 inline-flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{actionError}</span>
                </div>
              )}

              <QuestionArea
                question={currentQuestion}
                options={currentOptions}
                mode={mode}
                selectedLabel={selectedUiLabel}
                locked={hardLocked}
                showFeedback={showFeedback}
                showExplanation={showExplanation}
                reviewIncorrectLabels={reviewIncorrectLabels}
                reviewCorrectLabel={reviewCorrectLabel}
                isAnswerCorrect={isAnswerCorrect}
                striked={striked}
                finished={finished}
                onSelect={handleSelectOption}
                onToggleStrike={handleToggleStrike}
                onResetMarks={handleResetMarks}
                note={currentNote}
                onSaveNote={handleSaveNote}
                savingNote={savingNoteId === currentQuestion.id}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateTo(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo(currentIndex + 1)}
                    disabled={currentIndex === orderedQuestions.length - 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Pregunta {currentIndex + 1} de {orderedQuestions.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => finishSession(false)}
                    disabled={finished}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {finishing ? "Finalizando..." : "Finalizar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Practice exit overlay (no native confirm) */}
      {showExitOverlay && mode === "practica" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-black/10 p-6 text-slate-900">
            <h2 className="text-lg font-semibold">Salir de la practica?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Puedes finalizarla ahora o guardarla para continuar despues.
            </p>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => finishSession(false)}
                disabled={finishing || pausing}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
              >
                {finishing ? "Finalizando..." : "Finalizar practica"}
              </button>

              <button
                type="button"
                onClick={pausePracticeSession}
                disabled={pausing || finishing}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                {pausing ? "Guardando..." : "Terminar mas tarde"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


