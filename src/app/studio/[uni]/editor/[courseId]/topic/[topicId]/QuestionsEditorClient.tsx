"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

  concepts: { id: string; title: string; order_number?: number }[];
  questions: any[];
  options: any[];
};

type DraftOption = {
  id: string;
  label: string;
  text: string;
  explanation: string;
  is_correct: boolean;
};

type Draft = {
  questionText: string;
  options: DraftOption[];
};

const BASE_LABELS = ["A", "B", "C", "D", "E"];

function nextLabel(existing: string[]) {
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  for (const l of labels) if (!existing.includes(l)) return l;
  return `X${existing.length + 1}`;
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
  /** ✅ FIX PERF: no recrear supabase en cada render */
  const supabase = useMemo(() => createClient(), []);

  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(
    concepts?.[0]?.id ?? null
  );

  const [busy, setBusy] = useState(false);

  // Edición
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinKey]);

  function persistPins(next: Set<string>) {
    setPinnedIds(next);
    try {
      localStorage.setItem(pinKey, JSON.stringify(Array.from(next)));
    } catch {}
  }

  const selectedConcept = useMemo(() => {
    return (concepts ?? []).find((c) => c.id === selectedConceptId) ?? null;
  }, [concepts, selectedConceptId]);

  const optionsByQ = useMemo(() => {
    const map = new Map<string, any[]>();
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

  const filteredQuestions = useMemo(() => {
    if (!selectedConceptId) return [];
    return (questions ?? []).filter((q) => q.concept_id === selectedConceptId);
  }, [questions, selectedConceptId]);

  // pinned arriba
  const orderedQuestions = useMemo(() => {
    const list = [...filteredQuestions];
    list.sort((a, b) => {
      const ap = pinnedIds.has(a.id) ? 1 : 0;
      const bp = pinnedIds.has(b.id) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return String(a.id).localeCompare(String(b.id));
    });
    return list;
  }, [filteredQuestions, pinnedIds]);

  async function refresh() {
    window.location.reload();
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
        ...(concepts ?? []).map((c) => c.order_number ?? 0)
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

      setSelectedConceptId(data.id);
      setEditingQuestionId(null);
      setDraft(null);
      setSelectMode(false);
      setSelectedIds(new Set());
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function renameConcept() {
    if (!selectedConcept) return alert("Primero elige un concepto.");
    const newTitle = prompt("Nuevo nombre del concepto:", selectedConcept.title);
    if (!newTitle) return;

    setBusy(true);
    try {
      const { error } = await supabase
        .from("concepts")
        .update({ title: newTitle.trim() })
        .eq("id", selectedConcept.id)
        .eq("university_id", universityId);

      if (error) return alert(error.message);
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

      const next = concepts.find((c) => c.id !== selectedConcept.id)?.id ?? null;
      setSelectedConceptId(next);
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
        })
        .select("id")
        .single();

      if (error) return alert(error.message);

      const qid = inserted.id;

      // ✅ FIX: options NO lleva course_id ni topic_id (tu tabla no lo tiene)
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

      setEditingQuestionId(qid);
      setSelectMode(false);
      setSelectedIds(new Set());

      await refresh();
    } finally {
      setBusy(false);
    }
  }

  // ✅ startEdit robusto: lee options reales, crea A–E si faltan
  async function startEdit(q: any) {
    setBusy(true);
    try {
      const { data: existing, error } = await supabase
        .from("options")
        .select("id,label,text,explanation,is_correct")
        .eq("university_id", universityId)
        .eq("question_id", q.id);

      if (error) return alert(error.message);

      const existingLabels = new Set((existing ?? []).map((o: any) => o.label));
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
        .map((o: any) => ({
          id: o.id,
          label: o.label ?? "",
          text: o.text ?? "",
          explanation: o.explanation ?? "",
          is_correct: !!o.is_correct,
        }))
        .sort((a: any, b: any) => String(a.label).localeCompare(String(b.label)));

      setEditingQuestionId(q.id);
      setDraft({
        questionText: q.text ?? "",
        options: draftOptions,
      });
    } finally {
      setBusy(false);
    }
  }

  function cancelEdit() {
    setEditingQuestionId(null);
    setDraft(null);
  }

  // EXACTAMENTE 1 correcta (en UI marcamos toggles; validación permite 2+)
  function toggleCorrect(label: string) {
    if (!draft) return;
    setDraft({
      ...draft,
      options: draft.options.map((o) =>
        o.label === label ? { ...o, is_correct: !o.is_correct } : o
      ),
    });
  }

  async function addDraftOption(questionId: string) {
    if (!draft) return;

    const label = nextLabel(draft.options.map((o) => o.label));

    setBusy(true);
    try {
      // ✅ FIX: options NO lleva course_id ni topic_id
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

  async function saveEdit(questionId: string) {
    if (!draft) return;

    const nonEmpty = draft.options.filter((o) => (o.text ?? "").trim().length > 0);
    if (nonEmpty.length < 5) {
      return alert("Debe haber mínimo 5 opciones con texto (no vacías).");
    }

    const correctCount = draft.options.filter((o) => o.is_correct).length;
    if (correctCount < 1) return alert("Marca al menos 1 opción como correcta.");
    // ✅ Permitimos 2+ correctas

    setBusy(true);
    try {
      const { error: qErr } = await supabase
        .from("questions")
        .update({ text: draft.questionText.trim() })
        .eq("id", questionId)
        .eq("university_id", universityId);

      if (qErr) return alert(qErr.message);

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

  async function bulkMoveToConcept() {
    if (selectedIds.size === 0) return;

    const list = (concepts ?? [])
      .filter((c) => c.id !== selectedConceptId)
      .map((c, idx) => `${idx + 1}. ${c.title}`)
      .join("\n");

    const input = prompt(`Mover a qué concepto?\n\n${list}\n\nEscribe el número:`);
    if (!input) return;

    const n = Number(input);
    if (!Number.isFinite(n) || n < 1) return alert("Número inválido.");

    const target = (concepts ?? [])
      .filter((c) => c.id !== selectedConceptId)[n - 1];

    if (!target) return alert("No existe ese concepto.");

    setBusy(true);
    try {
      const ids = Array.from(selectedIds);
      const { error } = await supabase
        .from("questions")
        .update({ concept_id: target.id })
        .in("id", ids)
        .eq("university_id", universityId);

      if (error) return alert(error.message);

      setSelectedIds(new Set());
      setSelectMode(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const canAddQuestion = !!selectedConceptId && !busy;

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
                setSelectedConceptId(e.target.value);
                setEditingQuestionId(null);
                setDraft(null);
                setSelectMode(false);
                setSelectedIds(new Set());
              }}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white min-w-[240px]"
            >
              {(concepts ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {selectedConcept && (
              <span className="text-sm text-slate-500">
                Bloque seleccionado: <b>{selectedConcept.title}</b>
              </span>
            )}
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
                onClick={bulkMoveToConcept}
                disabled={busy || (concepts?.length ?? 0) < 2}
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
              <div className="divide-y">
                {orderedQuestions.map((q: any) => {
                  const qOpts = optionsByQ.get(q.id) ?? [];
                  const isEditing = editingQuestionId === q.id;
                  const isPinned = pinnedIds.has(q.id);
                  const isChecked = selectedIds.has(q.id);

                  return (
                    <div key={q.id} className="p-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-4 flex gap-3">
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
                                      d ? { ...d, questionText: e.target.value } : d
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
                                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50"
                                    aria-label="Editar"
                                    disabled={busy}
                                  >
                                    ✎
                                  </button>

                                  <FeedbackButton
                                    payload={{ questionId: q.id, scope: "question" }}
                                    onClick={openFeedback}
                                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                  />
                                </div>
                              ) : null}

                              {!selectMode && isEditing ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => saveEdit(q.id)}
                                    disabled={busy}
                                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                  >
                                    Guardar
                                  </button>

                                  <button
                                    onClick={() => addDraftOption(q.id)}
                                    disabled={busy}
                                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                                  >
                                    + Opción
                                  </button>

                                  <button
                                    onClick={cancelEdit}
                                    disabled={busy}
                                    className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
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

                              <span className="inline-flex text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                                opciones: {qOpts.length}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-12 md:col-span-8 space-y-3">
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-50 text-xs font-semibold text-slate-600">
                              Opciones (mínimo 5) — 1 o más correctas
                            </div>

                            <div className="divide-y">
                              {(isEditing ? draft?.options ?? [] : qOpts).map((o: any) => (
                                <div
                                  key={o.label ?? o.id}
                                  className="px-3 py-2 flex gap-3 text-sm items-start"
                                >
                                  <span className="w-6 font-bold text-slate-600 mt-[2px]">
                                    {o.label}.
                                  </span>

                                  {!isEditing ? (
                                    <div className="flex-1 min-w-0">
                                      <div className="whitespace-pre-wrap break-words">
                                        {o.text || (
                                          <span className="text-slate-400">[vacío]</span>
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
                                                    ? { ...x, text: e.target.value }
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
                                            onChange={() => toggleCorrect(o.label)}
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
                                                  ? { ...x, explanation: e.target.value }
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
                              ))}
                            </div>
                          </div>

                          <div className="h-2 w-full rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

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

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        payload={feedbackPayload}
        onSubmit={({ payload, message }: { payload: FeedbackPayload; message: string }) => {
          console.log("FEEDBACK RECIBIDO", payload, message);
        }}
      />
    </div>
  );
}
