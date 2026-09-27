/** Points for tipper based on how many hints were revealed (0–3). */
export function tipperPointsForHints(hintsUsed: number): number {
  const n = Math.max(0, Math.min(3, Math.floor(hintsUsed)));
  if (n === 0) return 4;
  if (n === 1) return 2;
  if (n === 2) return 1;
  return 0;
}

/** Points for drawer based on which attempt succeeded (1–3). */
export function drawerPointsForAttempt(attemptNumber: number): number {
  if (attemptNumber === 1) return 4;
  if (attemptNumber === 2) return 2;
  if (attemptNumber === 3) return 1;
  return 0;
}

export const MAX_GUESS_ATTEMPTS = 3;
