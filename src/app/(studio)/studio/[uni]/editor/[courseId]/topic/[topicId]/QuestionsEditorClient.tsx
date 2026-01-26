"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

import { Pin, Trash2, MoveRight } from "lucide-react";

/** ✅ FIX IMPORTS: tu path real está en src/app/components/studio/... */
import FeedbackButton, {
  type FeedbackPayload,
} from "@/app/components/studio/FeedbackButton";
import FeedbackModal from "@/app/components/studio/FeedbackModal";

type Props = {
  uniCode: string;
  universityId: string;
  courseId: string;
  topicId: string;
  topicTitle: string;

  concepts: { id: string; title: string; order_number?: number | null }[];
  questions: QuestionRow[];
  options: OptionRow[];
};

type DraftOption = {
  id: string;
  label: string;
  text: string;
  explanation: string;
  is_correct: boolean;
};

type QuestionType = "default" | "matching" | "clinical_case" | "premise_reason";

type MatchingData = {
  left: string[];
  right: string[];
};

type QuestionRow = {
  id: string;
  topic_id?: string | null;
  text?: string | null;
  difficulty?: string | null;
  question_type?: string | null;
  matching_data?: MatchingData | Record<string, unknown> | null;

  /** ✅ NUEVO: clave canónica del matching (p.ej. [0,1,2,3]) */
  matching_key?: number[] | null;

  concept_id?: string | null;
  conceptId?: string | null;
  concept?: string | null;
};

type OptionRow = {
  id: string;
  question_id: string;
  label?: string | null;
  text?: string | null;
  explanation?: string | null;
  is_correct?: boolean | null;
};

type Draft = {
  questionText: string;
  options: DraftOption[];
  matchingLeft: string[];
  matchingRight: string[];
};

type Difficulty = "easy" | "medium" | "hard";

const BASE_LABELS = ["A", "B", "C", "D", "E"];
const MATCHING_LEFT_LABELS = ["A", "B", "C", "D"];
const MATCHING_RIGHT_LABELS = ["I", "II", "III", "IV"];

/** ✅ matching_key default: índice a índice */
const DEFAULT_MATCHING_KEY = [0, 1, 2, 3];

function nextLabel(existing: string[]) {
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  for (const l of labels) if (!existing.includes(l)) return l;
  return `X${existing.length + 1}`;
}

function clampText(input: string, max = 140) {
  const s = (input ?? "").trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

function normalizeDifficulty(raw: unknown): Difficulty {
  const v = String(raw ?? "").toLowerCase().trim();
  if (v === "easy" || v === "facil" || v === "fácil") return "easy";
  if (v === "hard" || v === "dificil" || v === "difícil") return "hard";
  if (v === "medium" || v === "medio") return "medium";
  return "medium";
}

function difficultyLabel(d: Difficulty) {
  if (d === "easy") return "Fácil";
  if (d === "hard") return "Difícil";
  return "Medio";
}

function difficultyRank(d: Difficulty) {
  if (d === "easy") return 0;
  if (d === "medium") return 1;
  return 2; // hard
}

function normalizeQuestionType(raw: unknown): QuestionType {
  const v = String(raw ?? "").toLowerCase().trim();
  if (v === "matching") return "matching";
  if (v === "clinical_case") return "clinical_case";
  if (v === "premise_reason") return "premise_reason";
  return "default";
}

function questionTypeLabel(t: QuestionType) {
  if (t === "matching") return "Relacionar conceptos";
  if (t === "clinical_case") return "Caso clínico";
  if (t === "premise_reason") return "Premisa/Razón";
  return "Predeterminado";
}

function normalizeMatchingSide(values: unknown, trim = false) {
  const base = Array.isArray(values) ? values : [];
  const out = base.map((v) => {
    const text = String(v ?? "");
    return trim ? text.trim() : text;
  });
  while (out.length < 4) out.push("");
  return out.slice(0, 4);
}

function normalizeMatchingData(raw: unknown): MatchingData {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    left: normalizeMatchingSide(obj.left),
    right: normalizeMatchingSide(obj.right),
  };
}

function groupMeta(d: Difficulty) {
  if (d === "easy") {
    return {
      title: "Fácil",
      wrap: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-800",
      dot: "bg-emerald-400",
    };
  }
  if (d === "hard") {
    return {
      title: "Difícil",
      wrap: "bg-red-50 border-red-200",
      text: "text-red-800",
      dot: "bg-red-400",
    };
  }
  return {
    title: "Medio",
    wrap: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-900",
    dot: "bg-yellow-400",
  };
}

export default function QuestionsEditorClient({
  uniCode,
  universityId,
  courseId,
  topicId,
  topicTitle,
  concepts,
  questions,
  options,
}: Props) {
  /** ✅ no recrear supabase en cada render */
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  // -----------------------------
  // Persistencia de concepto en URL
  // -----------------------------
  const conceptFromUrl = searchParams.get("concept");

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(
    conceptFromUrl ?? concepts?.[0]?.id ?? null
  );

  // ✅ Override local de títulos (para que Renombrar se vea instantáneo
  // y NO cambie el orden del selector aunque el server ordene por title)
  const [conceptTitleOverride, setConceptTitleOverride] = useState<
    Record<string, string>
  >({});

  // ✅ Mantener un orden estable por order_number (si existe), luego fallback por “posición”
  const conceptsOrdered = useMemo(() => {
    const list = [...(concepts ?? [])];
    list.sort((a, b) => {
      const ao = a.order_number ?? 1_000_000;
      const bo = b.order_number ?? 1_000_000;
      if (ao !== bo) return ao - bo;
      return String(a.id).localeCompare(String(b.id));
    });

    return list.map((c) => ({
      ...c,
      title: conceptTitleOverride[c.id] ?? c.title,
    }));
  }, [concepts, conceptTitleOverride]);

  // Mantener selección estable cuando cambien concepts/URL (por router.refresh)
  useEffect(() => {
    const all = conceptsOrdered ?? [];
    if (all.length === 0) {
      setSelectedConceptId(null);
      return;
    }

    // 1) si URL tiene concept válido => úsalo
    if (conceptFromUrl && all.some((c) => c.id === conceptFromUrl)) {
      setSelectedConceptId(conceptFromUrl);
      return;
    }

    // 2) si el seleccionado actual sigue existiendo => mantenlo
    if (selectedConceptId && all.some((c) => c.id === selectedConceptId)) {
      return;
    }

    // 3) fallback: primer concepto
    setSelectedConceptId(all[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conceptFromUrl, conceptsOrdered]);

  function setConceptAndPersist(id: string) {
    setSelectedConceptId(id);

    const sp = new URLSearchParams(searchParams.toString());
    sp.set("concept", id);

    // replace para no ensuciar el historial
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  // -----------------------------
  // Estado general
  // -----------------------------
  const [busy, setBusy] = useState(false);

  // ✅ Dropdown de dificultad (1 abierto a la vez)
  const [difficultyOpenId, setDifficultyOpenId] = useState<string | null>(null);
  const [questionTypeOpenId, setQuestionTypeOpenId] = useState<string | null>(
    null
  );

  const [conceptStatus, setConceptStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const conceptStatusTimer = useRef<number | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDifficultyOpenId(null);
        setQuestionTypeOpenId(null);
      }
    }

    function onMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (difficultyOpenId) {
        const insideDifficulty = target.closest(
          `[data-difficulty-root="${difficultyOpenId}"]`
        );
        if (!insideDifficulty) setDifficultyOpenId(null);
      }

      if (questionTypeOpenId) {
        const insideType = target.closest(
          `[data-question-type-root="${questionTypeOpenId}"]`
        );
        if (!insideType) setQuestionTypeOpenId(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [difficultyOpenId, questionTypeOpenId]);

  function pushConceptStatus(type: "success" | "error", message: string) {
    setConceptStatus({ type, message });
    if (conceptStatusTimer.current) {
      window.clearTimeout(conceptStatusTimer.current);
    }
    conceptStatusTimer.current = window.setTimeout(() => {
      setConceptStatus(null);
    }, 3500);
  }

  async function setDifficulty(questionId: string, d: Difficulty) {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("questions")
        .update({ difficulty: d })
        .eq("id", questionId)
        .eq("university_id", universityId);

      if (error) {
        alert(error.message);
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function setQuestionType(
    questionId: string,
    t: QuestionType,
    currentMatching: unknown
  ) {
    setBusy(true);
    try {
      const payload: {
        question_type: QuestionType;
        matching_data?: MatchingData;
        matching_key?: number[];
      } = { question_type: t };

      if (t === "matching") {
        const normalized = normalizeMatchingData(currentMatching ?? {});
        payload.matching_data = {
          left: normalized.left,
          right: normalized.right,
        };

        /** ✅ asegurar matching_key por defecto */
        payload.matching_key = DEFAULT_MATCHING_KEY;
      }

      const { error } = await supabase
        .from("questions")
        .update(payload)
        .eq("id", questionId)
        .eq("university_id", universityId);

      if (error) {
        alert(error.message);
        return;
      }

      if (t === "matching") {
        const { error: delErr } = await supabase
          .from("options")
          .delete()
          .eq("question_id", questionId)
          .eq("university_id", universityId);

        if (delErr) {
          alert(delErr.message);
          return;
        }
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // Edición
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [draft, setDraft] = useState<Draft | null>(null);

  // “post-create” auto edit
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackPayload, setFeedbackPayload] =
    useState<FeedbackPayload | null>(null);

  function openFeedback(payload: FeedbackPayload) {
    setFeedbackPayload(payload);
    setFeedbackOpen(true);
  }

  // Selección bulk
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pinned (localStorage por topic)
  const pinKey = `evaltia:pins:${topicId}`;
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(pinKey);
      if (!raw) return;
      const arr = JSON.parse(raw) as string[];
      setPinnedIds(new Set(arr));
    } catch {}
  }, [pinKey]);

  function persistPins(next: Set<string>) {
    setPinnedIds(next);
    try {
      localStorage.setItem(pinKey, JSON.stringify(Array.from(next)));
    } catch {}
  }

  const selectedConcept = useMemo(() => {
    return (
      (conceptsOrdered ?? []).find((c) => c.id === selectedConceptId) ?? null
    );
  }, [conceptsOrdered, selectedConceptId]);

  const optionsByQ = useMemo(() => {
    const map = new Map<string, OptionRow[]>();
    for (const opt of options) {
      const arr = map.get(opt.question_id) ?? [];
      arr.push(opt);
      map.set(opt.question_id, arr);
    }
    for (const [qid, arr] of map.entries()) {
      arr.sort((a, b) =>
        String(a.label ?? "").localeCompare(String(b.label ?? ""))
      );
      map.set(qid, arr);
    }
    return map;
  }, [options]);

  // ✅ filtro por concepto estable
  const filteredQuestions = useMemo<QuestionRow[]>(() => {
    if (!selectedConceptId) return [];
    const selected = String(selectedConceptId);

    return (questions ?? []).filter((q) => {
      const cid = q?.concept_id ?? q?.conceptId ?? q?.concept ?? null;
      return cid !== null && String(cid) === selected;
    });
  }, [questions, selectedConceptId]);

  /**
   * ✅ Orden final:
   * - Dentro de cada dificultad: pineadas arriba, luego estable por id
   * - Y mostramos divisores por dificultad
   */
  const orderedQuestions = useMemo<QuestionRow[]>(() => {
    const list = [...filteredQuestions];
    list.sort((a, b) => {
      const ad = difficultyRank(normalizeDifficulty(a?.difficulty));
      const bd = difficultyRank(normalizeDifficulty(b?.difficulty));
      if (ad !== bd) return ad - bd;

      const ap = pinnedIds.has(a.id) ? 1 : 0;
      const bp = pinnedIds.has(b.id) ? 1 : 0;
      if (ap !== bp) return bp - ap;

      return String(a.id).localeCompare(String(b.id));
    });
    return list;
  }, [filteredQuestions, pinnedIds]);

  // ✅ refresh sin recargar toda la página (NO pierde estado)
  async function refresh() {
    router.refresh();
  }

  // -----------------------------
  // CONCEPTOS
  // -----------------------------
  async function addConcept() {
    const title = prompt(
      "Nombre del nuevo concepto (ej: Clasificación de epitelios):"
    );
    if (!title) return;

    setBusy(true);
    try {
      const maxOrder = Math.max(
        0,
        ...(conceptsOrdered ?? []).map((c) => c.order_number ?? 0)
      );

      const { data, error } = await supabase
        .from("concepts")
        .insert({
          university_id: universityId,
          course_id: courseId,
          topic_id: topicId,
          title: title.trim(),
          order_number: maxOrder + 1,
        })
        .select("id")
        .single();

      if (error) return alert(error.message);

      setConceptAndPersist(data.id);

      setEditingQuestionId(null);
      setDraft(null);
      setSelectMode(false);
      setSelectedIds(new Set());

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  /** ✅ Renombrar funcional + no reordena visualmente */
  async function renameConcept() {
    if (!selectedConcept) {
      pushConceptStatus("error", "Primero elige un concepto.");
      return;
    }

    const currentTitle = selectedConcept.title ?? "";
    const newTitle = prompt("Nuevo nombre del concepto:", currentTitle);
    if (!newTitle) return;

    const cleaned = newTitle.trim();
    if (!cleaned) return;

    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("concepts")
        .update({ title: cleaned })
        .eq("id", selectedConcept.id)
        .eq("university_id", universityId)
        .select("id");

      if (error) {
        pushConceptStatus("error", `No se pudo renombrar: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        pushConceptStatus(
          "error",
          "No se pudo renombrar (verifica permisos/RLS)."
        );
        return;
      }

      // ✅ update inmediato del UI (sin depender de refresh)
      setConceptTitleOverride((prev) => ({
        ...prev,
        [selectedConcept.id]: cleaned,
      }));

      // ✅ refresca data server (por consistencia), pero el orden visual queda por order_number
      pushConceptStatus("success", "Concepto renombrado.");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteConcept() {
    if (!selectedConcept) return alert("Primero elige un concepto.");
    if (filteredQuestions.length > 0) {
      return alert("No se puede borrar: este concepto ya tiene preguntas.");
    }
    const ok = confirm(`¿Borrar concepto "${selectedConcept.title}"?`);
    if (!ok) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("concepts")
        .delete()
        .eq("id", selectedConcept.id)
        .eq("university_id", universityId);

      if (error) return alert(error.message);

      const next =
        conceptsOrdered.find((c) => c.id !== selectedConcept.id)?.id ?? null;

      if (next) setConceptAndPersist(next);
      else setSelectedConceptId(null);

      setEditingQuestionId(null);
      setDraft(null);
      setSelectMode(false);
      setSelectedIds(new Set());

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  // -----------------------------
  // PREGUNTAS
  // -----------------------------
  async function addQuestion() {
    if (!selectedConceptId) return alert("Primero crea o elige un concepto.");

    setBusy(true);
    try {
      const { data: inserted, error } = await supabase
        .from("questions")
        .insert({
          university_id: universityId,
          course_id: courseId,
          topic_id: topicId,
          concept_id: selectedConceptId,
          text: "Nueva pregunta…",
          difficulty: "medium",
          question_type: "default",
        })
        .select("id")
        .single();

      if (error) return alert(error.message);

      const qid = inserted.id;

      const base = BASE_LABELS.map((label) => ({
        university_id: universityId,
        question_id: qid,
        label,
        text: "",
        explanation: "",
        is_correct: false,
      }));

      const { error: optErr } = await supabase.from("options").insert(base);
      if (optErr) return alert(optErr.message);

      setPendingEditId(qid);
      setSelectMode(false);
      setSelectedIds(new Set());

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  // ✅ startEdit robusto: lee options reales, crea A–E si faltan
  async function startEdit(q: QuestionRow) {
    setBusy(true);
    try {
      const questionType = normalizeQuestionType(q?.question_type);
      if (questionType === "matching") {
        const matching = normalizeMatchingData(q?.matching_data);
        setEditingQuestionId(q.id);
        setDraft({
          questionText: q.text ?? "",
          options: [],
          matchingLeft: matching.left,
          matchingRight: matching.right,
        });
        return;
      }

      const { data: existing, error } = await supabase
        .from("options")
        .select("id,label,text,explanation,is_correct")
        .eq("university_id", universityId)
        .eq("question_id", q.id);

      if (error) return alert(error.message);

      const existingLabels = new Set((existing ?? []).map((o) => o.label));
      const missing = BASE_LABELS.filter((L) => !existingLabels.has(L));

      if (missing.length > 0) {
        const rows = missing.map((label) => ({
          university_id: universityId,
          question_id: q.id,
          label,
          text: "",
          explanation: "",
          is_correct: false,
        }));

        const { error: insErr } = await supabase.from("options").insert(rows);
        if (insErr) return alert(insErr.message);
      }

      const { data: finalOpts, error: finalErr } = await supabase
        .from("options")
        .select("id,label,text,explanation,is_correct")
        .eq("university_id", universityId)
        .eq("question_id", q.id);

      if (finalErr) return alert(finalErr.message);

      const draftOptions = (finalOpts ?? [])
        .map((o) => ({
          id: o.id,
          label: o.label ?? "",
          text: o.text ?? "",
          explanation: o.explanation ?? "",
          is_correct: !!o.is_correct,
        }))
        .sort((a, b) => String(a.label).localeCompare(String(b.label)));

      const matching = normalizeMatchingData(q?.matching_data);

      setEditingQuestionId(q.id);
      setDraft({
        questionText: q.text ?? "",
        options: draftOptions,
        matchingLeft: matching.left,
        matchingRight: matching.right,
      });
    } finally {
      setBusy(false);
    }
  }

  // ✅ Abrir edición automáticamente tras crear una pregunta
  useEffect(() => {
    if (!pendingEditId) return;

    const q = (questions ?? []).find((x) => x.id === pendingEditId);
    if (!q) return;

    setPendingEditId(null);

    const cid = q?.concept_id ?? null;
    if (cid) setConceptAndPersist(String(cid));

    void startEdit(q);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEditId, questions]);

  function cancelEdit() {
    setEditingQuestionId(null);
    setDraft(null);
  }

  function toggleCorrect(label?: string | null) {
    if (!draft) return;
    if (!label) return;
    setDraft({
      ...draft,
      options: draft.options.map((o) =>
        o.label === label ? { ...o, is_correct: !o.is_correct } : o
      ),
    });
  }

  function updateMatchingLeft(index: number, value: string) {
    setDraft((d) => {
      if (!d) return d;
      const next = normalizeMatchingSide(d.matchingLeft ?? []);
      next[index] = value;
      return { ...d, matchingLeft: next };
    });
  }

  function updateMatchingRight(index: number, value: string) {
    setDraft((d) => {
      if (!d) return d;
      const next = normalizeMatchingSide(d.matchingRight ?? []);
      next[index] = value;
      return { ...d, matchingRight: next };
    });
  }

  async function addDraftOption(questionId: string, isMatchingCurrent: boolean) {
    if (!draft || isMatchingCurrent) return;

    const label = nextLabel(draft.options.map((o) => o.label));

    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("options")
        .insert({
          university_id: universityId,
          question_id: questionId,
          label,
          text: "",
          explanation: "",
          is_correct: false,
        })
        .select("id")
        .single();

      if (error) return alert(error.message);

      setDraft((d) => {
        if (!d) return d;
        return {
          ...d,
          options: [
            ...d.options,
            { id: data.id, label, text: "", explanation: "", is_correct: false },
          ],
        };
      });
    } finally {
      setBusy(false);
    }
  }

  /** ✅ borrar opción (backend + draft) */
  async function deleteOption(optionId: string, isMatchingCurrent: boolean) {
    if (!draft || isMatchingCurrent) return;

    // no dejar menos de 5
    if ((draft.options?.length ?? 0) <= 5) {
      alert("No puedes bajar de 5 opciones.");
      return;
    }

    const opt = draft.options.find((x) => x.id === optionId);
    const label = opt?.label ?? "";

    const ok = confirm(`¿Eliminar la opción ${label || ""}?`);
    if (!ok) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("options")
        .delete()
        .eq("id", optionId)
        .eq("university_id", universityId);

      if (error) {
        alert(error.message);
        return;
      }

      // quitar del draft
      setDraft((d) => {
        if (!d) return d;
        return {
          ...d,
          options: d.options.filter((x) => x.id !== optionId),
        };
      });

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(q: QuestionRow) {
    if (!draft) return;
    if (!q?.id) return;

    const questionType = normalizeQuestionType(q?.question_type);
    const isMatching = questionType === "matching";

    if (!isMatching) {
      const nonEmpty = draft.options.filter(
        (o) => (o.text ?? "").trim().length > 0
      );
      if (nonEmpty.length < 5) {
        return alert("Debe haber mínimo 5 opciones con texto (no vacías).");
      }

      const correctCount = draft.options.filter((o) => o.is_correct).length;
      if (correctCount < 1)
        return alert("Marca al menos 1 opción como correcta.");
    }

    setBusy(true);
    try {
      const payload: {
        text: string;
        matching_data?: MatchingData;
        matching_key?: number[];
      } = {
        text: draft.questionText.trim(),
      };

      if (isMatching) {
        payload.matching_data = {
          left: normalizeMatchingSide(draft.matchingLeft ?? [], true),
          right: normalizeMatchingSide(draft.matchingRight ?? [], true),
        };

        /** ✅ asegurar matching_key */
        payload.matching_key = DEFAULT_MATCHING_KEY;
      }

      const { error: qErr } = await supabase
        .from("questions")
        .update(payload)
        .eq("id", q.id)
        .eq("university_id", universityId);

      if (qErr) return alert(qErr.message);

      if (!isMatching) {
        for (const o of draft.options) {
          if (!o.id) continue;

          const { error: oErr } = await supabase
            .from("options")
            .update({
              text: o.text ?? "",
              explanation: o.explanation ?? "",
              is_correct: !!o.is_correct,
            })
            .eq("id", o.id)
            .eq("university_id", universityId);

          if (oErr) return alert(oErr.message);
        }
      }

      setEditingQuestionId(null);
      setDraft(null);

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  // -----------------------------
  // SELECCIÓN (BULK)
  // -----------------------------
  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    const ok = confirm(
      `¿Borrar ${selectedIds.size} pregunta(s)? (se borran sus opciones)`
    );
    if (!ok) return;

    setBusy(true);
    try {
      const ids = Array.from(selectedIds);

      const { error: optErr } = await supabase
        .from("options")
        .delete()
        .in("question_id", ids)
        .eq("university_id", universityId);

      if (optErr) return alert(optErr.message);

      const { error: qErr } = await supabase
        .from("questions")
        .delete()
        .in("id", ids)
        .eq("university_id", universityId);

      if (qErr) return alert(qErr.message);

      const nextPins = new Set(pinnedIds);
      ids.forEach((id) => nextPins.delete(id));
      persistPins(nextPins);

      setSelectedIds(new Set());
      setSelectMode(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  function bulkPin() {
    if (selectedIds.size === 0) return;
    const next = new Set(pinnedIds);
    for (const id of selectedIds) next.add(id);
    persistPins(next);
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  // -----------------------------
  // ✅ Modal "Mover" pro
  // -----------------------------
  const [moveOpen, setMoveOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [moveTargetConceptId, setMoveTargetConceptId] = useState<string>("");

  useEffect(() => setMounted(true), []);

  function openMoveModal() {
    if (selectedIds.size === 0) return;
    setMoveTargetConceptId("");
    setMoveOpen(true);
  }

  function closeMoveModal() {
    setMoveOpen(false);
    setMoveTargetConceptId("");
  }

  const movePreviewText = useMemo(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return "";
    if (ids.length === 1) {
      const q = (questions ?? []).find((x) => x.id === ids[0]);
      return q?.text ? clampText(q.text, 160) : "Pregunta seleccionada";
    }
    return `${ids.length} preguntas seleccionadas`;
  }, [selectedIds, questions]);

  async function confirmMove() {
    if (selectedIds.size === 0) return;

    const targetId = moveTargetConceptId;
    if (!targetId) return alert("Elige un concepto destino.");

    if (targetId === selectedConceptId) {
      closeMoveModal();
      setSelectedIds(new Set());
      setSelectMode(false);
      return;
    }

    setBusy(true);
    try {
      const ids = Array.from(selectedIds);

      const { error } = await supabase
        .from("questions")
        .update({ concept_id: targetId })
        .in("id", ids)
        .eq("university_id", universityId);

      if (error) return alert(error.message);

      closeMoveModal();
      setSelectedIds(new Set());
      setSelectMode(false);

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const canAddQuestion = !!selectedConceptId && !busy;
  const shouldScrollQuestions = orderedQuestions.length > 10;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/studio/${uniCode}/editor/${courseId}`}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Volver a topics
          </Link>

          <h1 className="text-2xl font-bold mt-1">{topicTitle}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Elige un concepto y gestiona sus preguntas.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
          <span className="px-3 py-2 rounded-xl border border-slate-200 bg-white">
            Preguntas en este bloque: <b>{filteredQuestions.length}</b>
          </span>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-800">Concepto</span>

            <select
              value={selectedConceptId ?? ""}
              onChange={(e) => {
                setConceptAndPersist(e.target.value);
                setEditingQuestionId(null);
                setDraft(null);
                setSelectMode(false);
                setSelectedIds(new Set());
              }}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white min-w-[240px]"
            >
              {(conceptsOrdered ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={addConcept}
              disabled={busy}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              + Nuevo concepto
            </button>

            <button
              onClick={renameConcept}
              disabled={busy || !selectedConcept}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Renombrar
            </button>

            <button
              onClick={deleteConcept}
              disabled={busy || !selectedConcept}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 disabled:opacity-50"
            >
              Eliminar
            </button>

            <button
              onClick={() => {
                setSelectMode((v) => !v);
                setSelectedIds(new Set());
                setEditingQuestionId(null);
                setDraft(null);
              }}
              disabled={busy || filteredQuestions.length === 0}
              className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              {selectMode ? "Cancelar" : "Seleccionar"}
            </button>
          </div>
        </div>

        {conceptStatus ? (
          <div
            className={`mt-2 text-xs px-3 py-2 rounded-lg border ${
              conceptStatus.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {conceptStatus.message}
          </div>
        ) : null}

        {selectMode && selectedIds.size > 0 && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-700">
              Seleccionadas: <b>{selectedIds.size}</b>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={bulkPin}
                disabled={busy}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Pin className="h-4 w-4" aria-hidden="true" />
                Pinear
              </button>

              <button
                onClick={openMoveModal}
                disabled={busy || (conceptsOrdered?.length ?? 0) < 2}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <MoveRight className="h-4 w-4" aria-hidden="true" />
                Mover
              </button>

              <button
                onClick={bulkDelete}
                disabled={busy}
                className="px-3 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Borrar
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="relative">
        <div className="pb-24">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="font-semibold text-slate-900">
                {selectedConcept ? selectedConcept.title : "Bloque"}
              </div>

              <div className="md:hidden text-sm text-slate-600">
                Preguntas: <b>{filteredQuestions.length}</b>
              </div>
            </div>

            {!selectedConceptId ? (
              <div className="p-5" />
            ) : orderedQuestions.length === 0 ? (
              <div className="p-5 text-sm text-slate-600">
                Este bloque aún no tiene preguntas. Baja y presiona{" "}
                <b>“Agregar pregunta”</b>.
              </div>
            ) : (
              <div
                className={
                  shouldScrollQuestions
                    ? "max-h-[70vh] overflow-y-auto pr-2 scrollbar-soft"
                    : ""
                }
              >
                <div className="divide-y">
                  {orderedQuestions.map((q, idx) => {
                    const qOpts = optionsByQ.get(q.id) ?? [];
                    const isEditing = editingQuestionId === q.id;
                    const isPinned = pinnedIds.has(q.id);
                    const isChecked = selectedIds.has(q.id);

                    const diff: Difficulty = normalizeDifficulty(q?.difficulty);
                    const questionType: QuestionType = normalizeQuestionType(
                      q?.question_type
                    );
                    const isMatching = questionType === "matching";
                    const matching = normalizeMatchingData(q?.matching_data);

                    const prev = orderedQuestions[idx - 1];
                    const prevDiff: Difficulty | null = prev
                      ? normalizeDifficulty(prev?.difficulty)
                      : null;

                    const showDivider = idx === 0 || prevDiff !== diff;
                    const meta = groupMeta(diff);

                    return (
                      <div key={q.id}>
                        {/* ✅ Divisor por dificultad */}
                        {showDivider ? (
                          <div
                            className={`px-4 py-2 border-y ${meta.wrap} flex items-center justify-between`}
                          >
                            <div
                              className={`text-xs font-bold ${meta.text} flex items-center gap-2`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${meta.dot}`}
                              />
                              {meta.title}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Agrupación por nivel
                            </div>
                          </div>
                        ) : null}

                        <div className="p-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-5 flex gap-3">
                              {selectMode ? (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelected(q.id)}
                                  className="mt-1 h-5 w-5"
                                  aria-label="Seleccionar pregunta"
                                />
                              ) : (
                                <div className="w-5" />
                              )}

                              <div className="min-w-0 w-full">
                                <div className="flex items-start justify-between gap-2">
                                  {!isEditing ? (
                                    <div className="min-w-0 w-full">
                                      <div className="flex items-start gap-2">
                                        {isPinned && (
                                          <Pin
                                            className="h-4 w-4 mt-[2px] text-slate-500"
                                            aria-hidden="true"
                                          />
                                        )}
                                        <p className="text-sm font-semibold text-slate-900 whitespace-pre-wrap break-words">
                                          {q.text}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <textarea
                                      value={draft?.questionText ?? ""}
                                      onChange={(e) =>
                                        setDraft((d) =>
                                          d
                                            ? {
                                                ...d,
                                                questionText: e.target.value,
                                              }
                                            : d
                                        )
                                      }
                                      rows={4}
                                      className="w-full text-sm font-semibold border border-slate-200 rounded-lg px-2 py-2 resize-y"
                                      placeholder="Escribe la pregunta (puede tener Enter)…"
                                    />
                                  )}

                                  {!selectMode && !isEditing ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => startEdit(q)}
                                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                        aria-label="Editar"
                                        disabled={busy}
                                        title="Editar"
                                      >
                                        ✎
                                      </button>

                                      <FeedbackButton
                                        payload={{
                                          questionId: q.id,
                                          scope: "question",
                                        }}
                                        onClick={openFeedback}
                                        className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                      />
                                    </div>
                                  ) : null}

                                  {!selectMode && isEditing ? (
                                    <div className="flex flex-col items-end gap-2">
                                      <button
                                        onClick={() => saveEdit(q)}
                                        disabled={busy}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                      >
                                        Guardar
                                      </button>

                                      {!isMatching ? (
                                        <button
                                          onClick={() => addDraftOption(q.id, isMatching)}
                                          disabled={busy}
                                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                        >
                                          + Opción
                                        </button>
                                      ) : null}

                                      <button
                                        onClick={cancelEdit}
                                        disabled={busy}
                                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  ) : null}
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="inline-flex text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                    código: {q.id.slice(0, 8)}…
                                  </span>

                                  {!isMatching ? (
                                    <span className="inline-flex text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                      opciones: {qOpts.length}
                                    </span>
                                  ) : null}
                                </div>

                                {/* ✅ Área “Nivel” + “Tipo de pregunta” */}
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {/* NIVEL */}
                                  <div
                                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                                    data-difficulty-root={String(q.id)}
                                  >
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50">
                                      Nivel
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDifficultyOpenId((prev) =>
                                          prev === String(q.id)
                                            ? null
                                            : String(q.id)
                                        )
                                      }
                                      disabled={busy}
                                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50"
                                    >
                                      <span className="text-sm font-semibold text-slate-800">
                                        {difficultyLabel(diff)}
                                      </span>
                                      <span className="text-slate-400 text-lg leading-none">
                                        ▾
                                      </span>
                                    </button>

                                    {difficultyOpenId === String(q.id) ? (
                                      <div className="border-t border-slate-200">
                                        {(
                                          [
                                            { v: "easy", t: "Fácil" },
                                            { v: "medium", t: "Medio" },
                                            { v: "hard", t: "Difícil" },
                                          ] as const
                                        ).map((x) => {
                                          const active = diff === x.v;
                                          return (
                                            <button
                                              key={x.v}
                                              type="button"
                                              onClick={async () => {
                                                await setDifficulty(q.id, x.v);
                                                setDifficultyOpenId(null);
                                              }}
                                              disabled={busy}
                                              className={`w-full text-left px-3 py-2 text-sm font-semibold border-b border-slate-100 last:border-b-0
                                                ${
                                                  active
                                                    ? "bg-slate-100 text-slate-900"
                                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                              {x.t}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : null}
                                  </div>

                                  {/* TIPO DE PREGUNTA */}
                                  <div
                                    className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                                    data-question-type-root={String(q.id)}
                                  >
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50">
                                      Tipo de pregunta
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setQuestionTypeOpenId((prev) =>
                                          prev === String(q.id)
                                            ? null
                                            : String(q.id)
                                        )
                                      }
                                      disabled={busy}
                                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50"
                                    >
                                      <span className="text-sm font-semibold text-slate-800">
                                        {questionTypeLabel(questionType)}
                                      </span>
                                      <span className="text-slate-400 text-lg leading-none">
                                        ▾
                                      </span>
                                    </button>

                                    {questionTypeOpenId === String(q.id) ? (
                                      <div className="border-t border-slate-200">
                                        {(
                                          [
                                            { v: "default", t: "Predeterminado" },
                                            {
                                              v: "matching",
                                              t: "Relacionar conceptos",
                                            },
                                            { v: "clinical_case", t: "Caso clínico" },
                                            {
                                              v: "premise_reason",
                                              t: "Premisa/Razón",
                                            },
                                          ] as const
                                        ).map((x) => {
                                          const active = questionType === x.v;
                                          return (
                                            <button
                                              key={x.v}
                                              type="button"
                                              onClick={async () => {
                                                await setQuestionType(
                                                  q.id,
                                                  x.v,
                                                  q?.matching_data
                                                );
                                                setQuestionTypeOpenId(null);
                                              }}
                                              disabled={busy}
                                              className={`w-full text-left px-3 py-2 text-sm font-semibold border-b border-slate-100 last:border-b-0
                                                ${
                                                  active
                                                    ? "bg-slate-100 text-slate-900"
                                                    : "bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                              {x.t}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
                                    <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50">
                                      Etiquetas (próximamente)
                                    </div>
                                    <div className="px-3 py-2 text-xs text-slate-500">
                                      Aquí irá tu selector de tags cuando me las
                                      digas.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-span-12 md:col-span-7 space-y-3">
                              {isMatching ? (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                  <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-600">
                                    Relacionar conceptos
                                  </div>
                                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Conceptos
                                      </div>
                                      {MATCHING_LEFT_LABELS.map((label, idx) => {
                                        const value = isEditing
                                          ? draft?.matchingLeft?.[idx] ?? ""
                                          : matching.left[idx] ?? "";
                                        return (
                                          <div
                                            key={label}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="w-5 text-xs font-semibold text-slate-500 mt-1">
                                              {label}
                                            </span>
                                            {isEditing ? (
                                              <input
                                                value={value}
                                                onChange={(e) =>
                                                  updateMatchingLeft(
                                                    idx,
                                                    e.target.value
                                                  )
                                                }
                                                className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                                                placeholder={`Concepto ${label}`}
                                              />
                                            ) : (
                                              <div className="flex-1 text-sm text-slate-800 whitespace-pre-wrap break-words">
                                                {value ? (
                                                  value
                                                ) : (
                                                  <span className="text-slate-400">
                                                    [vacío]
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="space-y-2">
                                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                        Definiciones
                                      </div>
                                      {MATCHING_RIGHT_LABELS.map((label, idx) => {
                                        const value = isEditing
                                          ? draft?.matchingRight?.[idx] ?? ""
                                          : matching.right[idx] ?? "";
                                        return (
                                          <div
                                            key={label}
                                            className="flex items-start gap-2"
                                          >
                                            <span className="w-5 text-xs font-semibold text-slate-500 mt-1">
                                              {label}
                                            </span>
                                            {isEditing ? (
                                              <input
                                                value={value}
                                                onChange={(e) =>
                                                  updateMatchingRight(
                                                    idx,
                                                    e.target.value
                                                  )
                                                }
                                                className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                                                placeholder={`Definición ${label}`}
                                              />
                                            ) : (
                                              <div className="flex-1 text-sm text-slate-800 whitespace-pre-wrap break-words">
                                                {value ? (
                                                  value
                                                ) : (
                                                  <span className="text-slate-400">
                                                    [vacío]
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              {!isMatching ? (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                  <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-600">
                                    Opciones (mínimo 5) — 1 o más correctas
                                  </div>

                                  <div className="divide-y">
                                    {(isEditing ? draft?.options ?? [] : qOpts).map(
                                      (o) => {
                                        const isCorrectView =
                                          !isEditing && !!o?.is_correct;

                                        return (
                                          <div
                                            key={o.label ?? o.id}
                                            className={`px-3 py-2 flex gap-3 text-sm items-start ${
                                              isCorrectView ? "bg-green-50" : "bg-white"
                                            }`}
                                          >
                                            {/* ✅ Columna letra + icono delete (solo en edición) */}
                                            <div className="w-8 flex flex-col items-center pt-[2px]">
                                              <span className="font-bold text-slate-600 leading-none">
                                                {o.label}.
                                              </span>

                                              {isEditing ? (
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    deleteOption(o.id, isMatching)
                                                  }
                                                  disabled={busy}
                                                  className="mt-1 text-[11px] leading-none text-slate-400 hover:text-red-600"
                                                  aria-label={`Eliminar opción ${o.label}`}
                                                  title="Eliminar opción"
                                                >
                                                  🗑
                                                </button>
                                              ) : null}
                                            </div>

                                            {!isEditing ? (
                                              <div className="flex-1 min-w-0">
                                                <div className="whitespace-pre-wrap break-words">
                                                  {o.text || (
                                                    <span className="text-slate-400">
                                                      [vacío]
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex-1 min-w-0 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                  <input
                                                    value={o.text ?? ""}
                                                    onChange={(e) => {
                                                      setDraft((d) => {
                                                        if (!d) return d;
                                                        return {
                                                          ...d,
                                                          options: d.options.map((x) =>
                                                            x.label === o.label
                                                              ? {
                                                                  ...x,
                                                                  text: e.target.value,
                                                                }
                                                              : x
                                                          ),
                                                        };
                                                      });
                                                    }}
                                                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1"
                                                    placeholder={`Texto opción ${o.label}`}
                                                  />

                                                  <label className="flex items-center gap-2 text-xs text-slate-600">
                                                    <input
                                                      type="checkbox"
                                                      checked={!!o.is_correct}
                                                      onChange={() =>
                                                        toggleCorrect(o.label)
                                                      }
                                                    />
                                                    Correcta
                                                  </label>
                                                </div>

                                                <input
                                                  value={o.explanation ?? ""}
                                                  onChange={(e) => {
                                                    setDraft((d) => {
                                                      if (!d) return d;
                                                      return {
                                                        ...d,
                                                        options: d.options.map((x) =>
                                                          x.label === o.label
                                                            ? {
                                                                ...x,
                                                                explanation:
                                                                  e.target.value,
                                                              }
                                                            : x
                                                        ),
                                                      };
                                                    });
                                                  }}
                                                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                                  placeholder="Explicación (solo se ve en edición)"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              ) : null}

                              <div className="h-2 w-full rounded bg-slate-100" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ✅ Sticky bar inferior */}
        <div className="sticky bottom-0 z-10">
          <div className="mx-auto max-w-[1400px]">
            <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between">
              {selectedConcept && (
                <div className="text-sm text-slate-600">
                  Estás editando: <b>{selectedConcept.title}</b>
                </div>
              )}

              <button
                onClick={addQuestion}
                disabled={!canAddQuestion}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#3A5873] text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Procesando…" : "Agregar pregunta"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MODAL MOVER */}
      {mounted && moveOpen
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
              <div className="absolute inset-0" onClick={() => setMoveOpen(false)} />

              <div
                className="relative w-full max-w-md rounded-2xl bg-white/90 backdrop-blur border border-black/5 shadow-lg p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Mover pregunta{selectedIds.size === 1 ? "" : "s"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{movePreviewText}</p>
                  </div>

                  <button
                    onClick={() => setMoveOpen(false)}
                    className="rounded-full border p-1.5 hover:bg-slate-50"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-600 mb-2">
                    Mover a:
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="max-h-72 overflow-y-auto divide-y">
                      {(conceptsOrdered ?? []).map((c) => {
                        const isCurrent = c.id === selectedConceptId;
                        const selected = c.id === moveTargetConceptId;

                        return (
                          <button
                            key={c.id}
                            onClick={() => setMoveTargetConceptId(c.id)}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-3
                              ${selected ? "bg-slate-100" : "hover:bg-slate-50"}
                              ${isCurrent ? "opacity-60" : ""}`}
                          >
                            <span className="min-w-0 truncate">
                              {c.title}
                              {isCurrent ? (
                                <span className="ml-2 text-xs text-slate-500">
                                  (actual)
                                </span>
                              ) : null}
                            </span>

                            <span
                              className={`text-xs rounded-full px-2 py-1 border
                                ${selected ? "border-slate-400" : "border-transparent"}`}
                            >
                              {selected ? "Seleccionado" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setMoveOpen(false)}
                      className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
                      disabled={busy}
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={confirmMove}
                      className="px-3 py-2 rounded-xl text-sm font-semibold bg-[#3A5873] text-white hover:opacity-90 disabled:opacity-50"
                      disabled={busy || !moveTargetConceptId}
                    >
                      {busy ? "Moviendo…" : "Mover"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        payload={feedbackPayload}
        onSubmit={({
          payload,
          message,
        }: {
          payload: FeedbackPayload;
          message: string;
        }) => {
          console.log("FEEDBACK RECIBIDO", payload, message);
        }}
      />
    </div>
  );
}
