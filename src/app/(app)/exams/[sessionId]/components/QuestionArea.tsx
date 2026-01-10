"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Loader2, NotebookPen, Plus } from "lucide-react";
import type { ExamMode, ExamOption, ExamQuestion } from "../../lib/types";
import { OptionItem } from "./OptionItem";

type Props = {
  question: ExamQuestion;
  options: ExamOption[];
  mode: ExamMode;
  selectedLabel: string | null; // ✅ ahora esto será A|B|C|D|E (UI)
  locked: boolean;
  showFeedback: boolean;
  showExplanation: boolean;
  isAnswerCorrect: boolean;
  striked: Set<string>; // ✅ ahora esto guardará A|B|C|D|E
  finished: boolean;
  onSelect: (label: string) => void; // ✅ recibe A|B|C|D|E
  onToggleStrike: (label: string) => void; // ✅ recibe A|B|C|D|E
  note?: string;
  onSaveNote: (text: string) => Promise<void>;
  savingNote: boolean;
};

const UI_LABELS = ["A", "B", "C", "D", "E"] as const;

/**
 * ✅ Highlight estilo AMBOSS (amarillo) - estable
 * - Solo actúa si la selección está dentro de `container`
 * - Si la selección toca un highlight, se quita SOLO en esa selección (split)
 * - Si no toca highlight, se aplica highlight a la selección
 */
function toggleHighlightSelection(container: HTMLElement) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const common = range.commonAncestorContainer;
  if (!container.contains(common)) return;

  const isTextNode = (n: Node): n is Text => n.nodeType === Node.TEXT_NODE;

  const getHighlightEl = (node: Node | null) => {
    const el =
      (node as any)?.nodeType === 1 ? (node as Element) : (node as any)?.parentElement;
    return el?.closest?.("span[data-ev-highlight='1']") as HTMLSpanElement | null;
  };

  const unwrap = (span: HTMLSpanElement) => {
    const parent = span.parentNode;
    if (!parent) return;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    parent.removeChild(span);
  };

  const startHL = getHighlightEl(range.startContainer);
  const endHL = getHighlightEl(range.endContainer);
  const selectionTouchesHighlight = !!startHL || !!endHL;

  if (selectionTouchesHighlight) {
    try {
      const r = range.cloneRange();
      const extracted = r.extractContents();

      const walker = document.createTreeWalker(extracted, NodeFilter.SHOW_ELEMENT);
      const toUnwrap: HTMLSpanElement[] = [];
      let node = walker.nextNode();
      while (node) {
        const el = node as Element;
        if (el.tagName === "SPAN" && el.getAttribute("data-ev-highlight") === "1") {
          toUnwrap.push(el as HTMLSpanElement);
        }
        node = walker.nextNode();
      }
      toUnwrap.reverse().forEach((sp) => unwrap(sp));

      r.insertNode(extracted);
      sel.removeAllRanges();
      return;
    } catch {
      if (startHL) unwrap(startHL);
      if (endHL && endHL !== startHL) unwrap(endHL);
      sel.removeAllRanges();
      return;
    }
  }

  try {
    const r = range.cloneRange();
    const extracted = r.extractContents();

    const hasContent =
      extracted.childNodes.length > 0 &&
      Array.from(extracted.childNodes).some((n) => {
        if (isTextNode(n)) return n.textContent?.trim().length;
        return true;
      });

    if (!hasContent) {
      sel.removeAllRanges();
      return;
    }

    const span = document.createElement("span");
    span.setAttribute("data-ev-highlight", "1");

    span.style.backgroundColor = "#fde047";
    span.style.borderRadius = "4px";
    span.style.padding = "0 2px";

    span.appendChild(extracted);
    r.insertNode(span);

    sel.removeAllRanges();
  } catch {
    sel.removeAllRanges();
  }
}

export function QuestionArea({
  question,
  options,
  mode,
  selectedLabel,
  locked,
  showFeedback,
  showExplanation,
  isAnswerCorrect,
  striked,
  finished,
  onSelect,
  onToggleStrike,
  note,
  onSaveNote,
  savingNote,
}: Props) {
  const [showHint, setShowHint] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(note ?? "");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [savingLocal, setSavingLocal] = useState(false);

  const questionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNoteValue(note ?? "");
  }, [note, question.id]);

  const hasHint = !!question.hint?.trim();

  const handleSaveNote = async () => {
    setNoteError(null);
    setSavingLocal(true);
    try {
      await onSaveNote(noteValue);
      setNotesOpen(false);
    } catch (err: any) {
      setNoteError(err?.message ?? "No se pudo guardar la nota.");
    } finally {
      setSavingLocal(false);
    }
  };

  // ❌ simulacro no muestra explicación (por ahora)
  const canShowExplanation = mode !== "simulacro" && showExplanation && !!selectedLabel;

  // ✅ 1) Fuerza letras A–E por ORDEN VISUAL (index)
  const uiOptions = useMemo(() => {
    return (options ?? []).slice(0, 5).map((opt, idx) => ({
      opt,
      uiLabel: (UI_LABELS[idx] ?? String(idx + 1)) as string,
    }));
  }, [options]);

  // ✅ 2) Estados usando selectedLabel UI (A–E), no opt.label real
  const optionStates = useMemo(() => {
    const sel = (selectedLabel ?? "").toUpperCase();

    return uiOptions.map(({ opt, uiLabel }) => {
      const label = uiLabel.toUpperCase();
      const isSelected = sel !== "" && sel === label;

      return {
        opt,
        uiLabel,
        isSelected,
        showIncorrect: showFeedback && isSelected && !opt.is_correct,
        showCorrect: showFeedback && isSelected && !!opt.is_correct,
        showThisExplanation: canShowExplanation && isSelected,
      };
    });
  }, [uiOptions, selectedLabel, showFeedback, canShowExplanation]);

  return (
    <div className="space-y-4">
      {/* PREGUNTA */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pregunta</p>

        <div
          ref={questionRef}
          onMouseUp={() => {
            const el = questionRef.current;
            if (!el) return;
            toggleHighlightSelection(el);
          }}
          className="mt-2 text-lg font-semibold text-slate-900 whitespace-pre-wrap break-words select-text"
        >
          {question.text}
        </div>

        {question.image_url && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={question.image_url} alt="Imagen" className="w-full object-cover" />
          </div>
        )}

        {/* BOTONES */}
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            disabled={!hasHint}
            className={`inline-flex items-center gap-2 text-sm font-semibold text-slate-600 ${
              !hasHint ? "opacity-50 cursor-not-allowed" : "hover:underline"
            }`}
          >
            <Eye className="h-4 w-4" />
            Ver pista
          </button>

          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Agregar notas
          </button>
        </div>

        {showHint && hasHint && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
            {question.hint}
          </div>
        )}

        {/* NOTAS */}
        {notesOpen && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <NotebookPen className="h-4 w-4" />
              Nota personal
            </div>

            <textarea
              rows={3}
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
              placeholder="Escribe una nota para esta pregunta"
            />

            {noteError && <p className="text-xs text-red-600">{noteError}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={savingNote || savingLocal}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 inline-flex items-center gap-2"
              >
                {(savingNote || savingLocal) && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar nota
              </button>

              <button
                type="button"
                onClick={() => setNotesOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* OPCIONES */}
      <div className="space-y-2">
        {optionStates.map(({ opt, uiLabel, isSelected, showCorrect, showIncorrect, showThisExplanation }, idx) => (
          <OptionItem
            key={opt.id ?? `${question.id}-${idx}`}
            // ✅ clonamos la opción, pero forzamos label UI (A–E) SOLO para mostrar
            option={{ ...opt, label: uiLabel }}
            isSelected={isSelected}
            isDisabled={locked || finished}
            showCorrect={showCorrect}
            showIncorrect={showIncorrect}
            showExplanation={showThisExplanation}
            // ✅ strike ahora se guarda por letra UI (A–E)
            striked={striked.has(uiLabel)}
            // ✅ al seleccionar, mandamos A–E
            onSelect={() => onSelect(uiLabel)}
            onToggleStrike={() => onToggleStrike(uiLabel)}
          />
        ))}

        {mode !== "simulacro" && showFeedback && (
          <p className={`text-sm font-semibold ${isAnswerCorrect ? "text-emerald-700" : "text-amber-700"}`}>
            {isAnswerCorrect ? "Respuesta correcta" : "Respuesta incorrecta"}
          </p>
        )}
      </div>
    </div>
  );
}
