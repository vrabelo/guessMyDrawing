import type { FormEvent } from "react";
import { LETTER_GRACE_MS } from "@tipp-my-draw/shared";

type GuessCardProps = {
  guess: string;
  locked: boolean;
  elapsedMs: number;
  letterMask: string | null;
  potentialPoints: number;
  onGuessChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onPass: () => void;
};

function formatPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

function formatCountdown(ms: number): string {
  const s = Math.max(0, ms / 1000);
  return s.toFixed(1).replace(".", ",");
}

export function GuessCard({
  guess,
  locked,
  elapsedMs,
  letterMask,
  potentialPoints,
  onGuessChange,
  onSubmit,
  onPass,
}: GuessCardProps) {
  if (locked) return null;

  const inGrace = elapsedMs < LETTER_GRACE_MS;
  const remainingGrace = Math.max(0, LETTER_GRACE_MS - elapsedMs);

  return (
    <div className="guess-top-bar">
      <div className="guess-top-bar__row">
        <form className="guess-top-bar__search" onSubmit={onSubmit}>
          <input
            name="guess"
            value={guess}
            onChange={(e) => onGuessChange(e.target.value)}
            placeholder="Mit látsz a képen ?"
            className="guess-faint-input min-w-0 flex-1"
            autoComplete="off"
          />
          <button type="submit" className="guess-faint-btn">
            Küldés
          </button>
          <button
            type="button"
            className="guess-faint-btn guess-faint-btn--pass"
            onClick={onPass}
          >
            Passz
          </button>
        </form>

        <div className="guess-top-bar__feedback" aria-live="polite">
          <p className="guess-top-bar__letter-mask" aria-label="Betűsegítség">
            {letterMask ?? "…"}
          </p>
          <p className="guess-top-bar__reward">
            <strong>{formatPoints(potentialPoints)}</strong> pont
            {inGrace ? (
              <span className="guess-top-bar__grace">
                {" "}
                · betű {formatCountdown(remainingGrace)} mp múlva
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}
