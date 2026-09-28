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
