export type User = {
  id: string;
  alias: string;
  pass: string;
};

export type Drawing = {
  id: string;
  userId: string;
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  /** When true, drawing is in the play pool and locked for editing. */
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type GuessScore = {
  id: string;
  userId: string;
  points: number;
};

export type DrawScore = {
  id: string;
  userId: string;
  points: number;
};

export type ProgressStatus = "in_progress" | "solved" | "failed" | "expired";

export type UserDrawingProgress = {
  id: string;
  userId: string;
  drawingId: string;
  status: ProgressStatus;
  attemptsUsed: number;
  /** Single optional hint slot. */
  hintsRevealed: [boolean];
  /** True after a previous failed round — next solve awards half tipper points. */
  priorFailure: boolean;
  /** Epoch ms when the tipper first opened this drawing for guessing. */
  guessStartedAt: number | null;
  updatedAt: number;
};

export type PublicUser = {
  id: string;
  alias: string;
};

export type PublicDrawing = {
  id: string;
  uploaderId: string;
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  imageDataUrl: string;
  authorAlias: string;
  createdAt: number;
};

/** Owner-facing drawing including answer and publish state. */
export type OwnedDrawing = {
  id: string;
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AvailableDrawing = PublicDrawing & {
  progress: UserDrawingProgress | null;
  /** Only set when status is solved */
  answer?: string;
};

export type LeaderboardEntry = {
  userId: string;
  alias: string;
  points: number;
};

export type LeaderboardsResponse = {
  tippers: LeaderboardEntry[];
  creators: LeaderboardEntry[];
  overall: LeaderboardEntry[];
};

export type UserStatsResponse = {
  totalGuesses: number;
  totalPoints: number;
  drawingsCount: number;
  guessPoints: number;
  drawPoints: number;
  ranks: {
    tipper: number | null;
    creator: number | null;
    overall: number | null;
  };
};

export type LoginRequest = {
  alias: string;
  pass: string;
};

export type RegisterRequest = {
  alias: string;
  pass: string;
};

export type LoginResponse = {
  token: string;
  user: PublicUser;
};

export type CreateDrawingRequest = {
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  published: boolean;
};

export type UpdateDrawingRequest = {
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  published: boolean;
};

export type GuessRequest = {
  guess: string;
};

export type GuessResponse = {
  correct: boolean;
  message: string;
  attemptsLeft: number;
  pointsAwarded: number | null;
  /** True when this was a final outcome (solved or failed round). */
  roundComplete: boolean;
  /** True when half-point retry multiplier was applied. */
  halfPointsApplied: boolean;
  progress: UserDrawingProgress;
  answer?: string;
};

export type PatchProgressRequest = {
  revealHint?: 1;
};

export type WsDrawingCreatedEvent = {
  type: "drawing.created";
  drawing: PublicDrawing;
};

/** Points for tipper: no hint → 10, with hint → 7. */
export function tipperPointsForHints(hintsUsed: number): number {
  return hintsUsed > 0 ? TIPPER_POINTS_WITH_HINT : TIPPER_POINTS_NO_HINT;
}

/** Points for drawer based on which attempt succeeded (1–3). */
export function drawerPointsForAttempt(attemptNumber: number): number {
  if (attemptNumber === 1) return 4;
  if (attemptNumber === 2) return 2;
  if (attemptNumber === 3) return 1;
  return 0;
}

/** Half tipper points when solving a previously failed drawing. */
export function applyRetryHalfPoints(
  points: number,
  priorFailure: boolean
): number {
  if (!priorFailure) return points;
  return Math.round(points * 50) / 100;
}

/** Grace period before letter reveals and time penalty start (ms). */
export const LETTER_GRACE_MS = 15_000;

/** @deprecated Use LETTER_GRACE_MS — kept as alias for older imports. */
export const GUESS_TIME_WINDOW_MS = LETTER_GRACE_MS;

/** Max time allowed to finish a new drawing before forced save. */
export const DRAW_TIME_LIMIT_MS = 120_000;

/** After the grace window, reveal one random letter every this many ms. */
export const LETTER_REVEAL_INTERVAL_MS = 5_000;

export const TIPPER_POINTS_NO_HINT = 10;
export const TIPPER_POINTS_WITH_HINT = 7;
export const TIPPER_MAX_POINTS = TIPPER_POINTS_NO_HINT;

/** Points deducted per full second after LETTER_GRACE_MS. */
export const TIPPER_PENALTY_PER_SEC = 0.1;

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
 * e.g. "_ _ _ _" then after reveals "a _ _ a" depending on shuffle.
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

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Tipper award: 10 without hint / 7 with hint, then −0.1 per second after 15s.
 * Floor at 0; prior-failure still halves.
 */
export function awardTipperPoints(
  hintsUsed: number,
  priorFailure: boolean,
  elapsedMs: number = 0
): number {
  const base = tipperPointsForHints(hintsUsed > 0 ? 1 : 0);
  let penalty = 0;
  if (Number.isFinite(elapsedMs) && elapsedMs > LETTER_GRACE_MS) {
    penalty =
      Math.floor((elapsedMs - LETTER_GRACE_MS) / 1000) * TIPPER_PENALTY_PER_SEC;
  }
  const raw = Math.max(0, round1(base - penalty));
  return applyRetryHalfPoints(raw, priorFailure);
}

export function potentialTipperPoints(
  hintsRevealed: [boolean] | [boolean, boolean, boolean],
  priorFailure: boolean,
  elapsedMs: number = 0
): number {
  const hintsUsed = hintsRevealed.some(Boolean) ? 1 : 0;
  return awardTipperPoints(hintsUsed, priorFailure, elapsedMs);
}

export const MAX_GUESS_ATTEMPTS = 3;

/** Shared paint / display bitmap size (16:9). */
export const CANVAS_W = 640;
export const CANVAS_H = 360;
export const CANVAS_ASPECT = CANVAS_W / CANVAS_H;

export {
  THEME_DATABASE,
  THEME_COUNT,
  THEME_CATEGORY_IDS,
  THEME_CATEGORY_LABELS,
  THEME_CATEGORY_BADGE_LABELS,
  THEMES_BY_CATEGORY,
  pickRandomTheme,
  pickRandomFromCategory,
  listThemeCategories,
  type ThemeCategory,
  type ThemeCategoryId,
  type ThemeEntry,
} from "./themes";
