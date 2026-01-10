"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { shuffleWithSeed } from "../lib/shuffle";
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

const UI_LABELS = ["A", "B", "C", "D", "E"] as const;

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
  const [finished, setFinished] = useState<boolean>(!!session.finished_at);
  const [finishing, setFinishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const [pendingUiByQuestion, setPendingUiByQuestion] = useState<Map<string, string>>(
    new Map()
  );

  const finishPostedRef = useRef<boolean>(!!session.finished_at);
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
      const seedLocal = `${session.id}-${q.id}`;
      const safe = pickFive(q.options ?? [], seedLocal);
      map.set(q.id, safe);
    }

    return map;
  }, [orderedQuestions, session.id]);

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

  if (!orderedQuestions.length) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="rounded-2xl bg-white/80 border border-black/5 shadow-lg p-6 text-slate-800">
          No hay preguntas en esta sesión.
        </div>
      </div>
    );
  }

  const currentQuestion = orderedQuestions[currentIndex];
  const currentOptions = optionsByQuestion.get(currentQuestion.id) ?? currentQuestion.options ?? [];

  const pendingUi = pendingUiByQuestion.get(currentQuestion.id) ?? null;
  const latestReal = getLatestAnswer(answersByQuestion, currentQuestion.id);

  const selectedUiLabel: string | null = useMemo(() => {
    if (pendingUi) return pendingUi;
    if (!latestReal) return null;

    const real = (latestReal.selected_option_label ?? "").toString();
    const idx = currentOptions.findIndex((o) => (o.label ?? "").toString() === real);
    if (idx < 0) return null;

    return UI_LABELS[idx] ?? null;
  }, [pendingUi, latestReal, currentOptions]);

  const striked = strikeState[currentQuestion.id] ?? new Set<string>();

  const mode = session.mode as ExamMode;
  const modeLabel = mode === "simulacro" ? "Simulacro" : mode === "repaso" ? "Repaso" : "Practica";

  const isPending = !!pendingUi;
  const isAnswerCorrect = latestReal?.is_correct ?? false;

  const locked =
    finished ||
    isPending ||
    (mode === "practica" ? !!latestReal : mode === "repaso" ? !!latestReal?.is_correct : false);

  const showFeedback = mode === "simulacro" ? finished : !!latestReal;
  const showExplanation = mode === "simulacro" ? finished : !!latestReal;

  const showTimer = !finished && mode !== "repaso" && session.timed && timeLeft !== null;

  const answeredByQuestion = useMemo(() => {
    const map = new Map<string, { answered: boolean; correct: boolean }>();
    orderedQuestions.forEach((q) => {
      const last = getLatestAnswer(answersByQuestion, q.id);
      map.set(q.id, { answered: !!last, correct: !!last?.is_correct });
    });
    return map;
  }, [orderedQuestions, answersByQuestion]);

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
    setStrikeState((prev) => {
      const next = { ...prev };
      const set = new Set(next[currentQuestion.id] ?? []);
      if (set.has(uiLabel)) set.delete(uiLabel);
      else set.add(uiLabel);
      next[currentQuestion.id] = set;
      return next;
    });
  };

  const handleSelectOption = async (uiLabel: string) => {
    if (finished) return;
    if (locked) return;
    if (striked.has(uiLabel)) return;

    setActionError(null);

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

    setPendingUiByQuestion((prev) => {
      const next = new Map(prev);
      next.set(currentQuestion.id, uiLabel);
      return next;
    });

    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          optionLabel: realOptionLabel,
          currentIndex,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error ?? "No se pudo guardar la respuesta.";
        throw new Error(msg);
      }

      const finalAnswer: ExamAnswer = {
        id: data?.answerId ?? `${currentQuestion.id}-${Date.now()}`,
        session_id: session.id,
        question_id: currentQuestion.id,
        selected_option_label: realOptionLabel,
        is_correct: !!data?.isCorrect,
        attempt: data?.attempt ?? ((latestReal?.attempt ?? 0) + 1),
        created_at: data?.created_at ?? new Date().toISOString(),
      };

      setAnswersByQuestion((prev) => {
        const next = new Map(prev);
        const list = [...(next.get(currentQuestion.id) ?? [])];
        list.push(finalAnswer);
        next.set(currentQuestion.id, list);
        return next;
      });

      setPendingUiByQuestion((prev) => {
        const next = new Map(prev);
        next.delete(currentQuestion.id);
        return next;
      });
    } catch (err: any) {
      setPendingUiByQuestion((prev) => {
        const next = new Map(prev);
        next.delete(currentQuestion.id);
        return next;
      });
      setActionError(err?.message ?? "Error guardando la respuesta.");
    }
  };

  const handleToggleFlag = async () => {
    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id }),
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
    setSavingNoteId(currentQuestion.id);
    setActionError(null);
    try {
      const res = await fetch(`/exams/api/sessions/${session.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: currentQuestion.id, text }),
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
          question_id: currentQuestion.id,
          text: data.note.text,
          updated_at: data.note.updated_at,
        };
        setNotesByQuestion((prev) => {
          const next = new Map(prev);
          next.set(currentQuestion.id, note);
          return next;
        });
      } else if (text.trim().length === 0) {
        setNotesByQuestion((prev) => {
          const next = new Map(prev);
          next.delete(currentQuestion.id);
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
    } catch (err: any) {
      if (!auto) setActionError(err?.message ?? "No se pudo cerrar la sesión.");
    } finally {
      setFinishing(false);
    }
  };

  const handleFeedback = () => {
    setActionError("Envia tu comentario a soporte@evaltia.com mientras activamos el canal de feedback.");
  };

  const navigateTo = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), orderedQuestions.length - 1);
    setCurrentIndex(clamped);
    setActionError(null);
  };

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
            onClose={() => router.push("/exams")}
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
                locked={locked}
                showFeedback={showFeedback}
                showExplanation={showExplanation}
                isAnswerCorrect={isAnswerCorrect}
                striked={striked}
                finished={finished}
                onSelect={handleSelectOption}
                onToggleStrike={handleToggleStrike}
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
    </div>
  );
}
