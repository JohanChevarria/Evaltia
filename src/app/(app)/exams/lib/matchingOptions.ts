import type { ExamOption } from "./types";
import { shuffleWithSeed } from "./shuffle";

export const DEFAULT_MATCHING_KEY = [0, 1, 2, 3] as const;
export type MatchingPerm = number[];

const LEFT_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const RIGHT_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function buildDefaultKey(size: number): number[] {
  return Array.from({ length: size }, (_, idx) => idx);
}

function isValidPerm(values: number[], size: number) {
  if (values.length !== size) return false;
  const unique = new Set(values);
  if (unique.size !== size) return false;
  return values.every((value) => Number.isInteger(value) && value >= 0 && value < size);
}

export function normalizeMatchingKey(key: unknown, size = 4): MatchingPerm {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 4;
  const fallback = buildDefaultKey(safeSize);
  if (!Array.isArray(key)) return fallback;

  const numeric = key.map((value) => Number(value)).filter((value) => Number.isInteger(value));
  if (!isValidPerm(numeric, safeSize)) return fallback;
  return numeric;
}

export function permToText(perm: MatchingPerm): string {
  const parts: string[] = [];
  for (let i = 0; i < perm.length; i += 1) {
    const left = LEFT_LABELS[i] ?? String.fromCharCode(65 + i);
    const right = RIGHT_LABELS[perm[i]] ?? String(perm[i] + 1);
    parts.push(`${left}${right}`);
  }
  return parts.join(", ");
}

function permKey(perm: MatchingPerm) {
  return perm.join(",");
}

function buildAllPermutations(size: number): MatchingPerm[] {
  const base = buildDefaultKey(size);
  const results: MatchingPerm[] = [];

  const permute = (arr: number[], start: number) => {
    if (start >= arr.length - 1) {
      results.push([...arr]);
      return;
    }
    for (let i = start; i < arr.length; i += 1) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      permute(arr, start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  };

  permute([...base], 0);
  return results;
}

type BuildParams = {
  sessionId: string;
  questionId: string;
  matching_key: unknown;
  size?: number;
};

export function buildMatchingExamOptions({
  sessionId,
  questionId,
  matching_key,
  size = 4,
}: BuildParams): ExamOption[] {
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 4;
  const correctPerm = normalizeMatchingKey(matching_key, safeSize);
  const correctKey = permKey(correctPerm);
  const seedBase = `${sessionId}-${questionId}`;

  const allPerms = buildAllPermutations(safeSize);
  const wrongCandidates = allPerms.filter((perm) => permKey(perm) !== correctKey);
  const wrongShuffled = shuffleWithSeed(wrongCandidates, `${seedBase}-wrong`);

  const wrongPerms: MatchingPerm[] = [];
  for (const perm of wrongShuffled) {
    if (wrongPerms.length >= 4) break;
    wrongPerms.push(perm);
  }

  if (wrongPerms.length < 4) {
    for (const perm of shuffleWithSeed(wrongCandidates, `${seedBase}-fill`)) {
      if (wrongPerms.length >= 4) break;
      if (!wrongPerms.some((existing) => permKey(existing) === permKey(perm))) {
        wrongPerms.push(perm);
      }
    }
  }

  while (wrongPerms.length < 4 && wrongCandidates.length > 0) {
    const perm = wrongCandidates[wrongPerms.length % wrongCandidates.length];
    wrongPerms.push(perm);
  }

  const combined = [correctPerm, ...wrongPerms];
  const shuffled = shuffleWithSeed(combined, `${seedBase}-final`).slice(0, 5);

  return shuffled.map((perm, idx) => ({
    id: `${questionId}:M${idx + 1}`,
    label: `M${idx + 1}`,
    text: permToText(perm),
    is_correct: permKey(perm) === correctKey,
    explanation: "",
  }));
}
