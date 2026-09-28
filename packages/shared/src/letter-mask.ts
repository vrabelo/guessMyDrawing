import { LETTER_GRACE_MS, LETTER_REVEAL_INTERVAL_MS } from "./scoring";

/** How many letters to reveal: 0 until 15s, then +1 every 5s. */
export function letterRevealCount(elapsedMs: number): number {
  if (!Number.isFinite(elapsedMs) || elapsedMs < LETTER_GRACE_MS) {
    return 0;
  }
  return (
    1 +
    Math.floor((elapsedMs - LETTER_GRACE_MS) / LETTER_REVEAL_INTERVAL_MS)
  );
}

/** Non-space letter count in the answer. */
export function answerLetterCount(answer: string): number {
  return [...answer].filter((ch) => ch !== " ").length;
}

/** True when every letter slot has been revealed by the timer. */
export function isAnswerFullyRevealed(
  answer: string,
  elapsedMs: number
): boolean {
  const n = answerLetterCount(answer);
  if (n <= 0) return false;
  return letterRevealCount(elapsedMs) >= n;
}

/** Deterministic shuffle of letter indices (spaces excluded). */
export function shuffledLetterIndices(
  answer: string,
  seed: string | number
): number[] {
  const indices: number[] = [];
  const chars = [...answer];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== " ") indices.push(i);
  }
  let s = hashSeed(seed);
  for (let i = indices.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = indices[i]!;
    indices[i] = indices[j]!;
    indices[j] = tmp;
  }
  return indices;
}

function hashSeed(seed: string | number): number {
  const str = String(seed);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Progressive answer mask with random reveal order.
 * Spaces stay as gaps and are never “revealed” slots.
 */
export function buildLetterMask(
  answer: string,
  revealedCount: number,
  seed: string | number = answer
): string {
  const chars = [...answer];
  const order = shuffledLetterIndices(answer, seed);
  const show = new Set(order.slice(0, Math.max(0, Math.floor(revealedCount))));
  const out: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    if (ch === " ") {
      out.push(" ");
      continue;
    }
    out.push(show.has(i) ? ch : "_");
  }
  return out.join(" ");
}
