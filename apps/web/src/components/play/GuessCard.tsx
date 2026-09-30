import type { FormEvent } from "react";
import { LETTER_GRACE_MS } from "@tipp-my-draw/shared";

type GuessCardProps = {
  guess: string;
  locked: boolean;
  elapsedMs: number;
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
  potentialPoints,
  onGuessChange,
  onSubmit,
  onPass,
}: GuessCardProps) {
  const inGrace = !locked && elapsedMs < LETTER_GRACE_MS;
  const remainingGrace = Math.max(0, LETTER_GRACE_MS - elapsedMs);

  return (
    <div className={["guess-top-bar", locked ? "guess-top-bar--locked" : ""].filter(Boolean).join(" ")}>
      <div className="guess-top-bar__row">
        <form
          className="guess-top-bar__search"
          onSubmit={(e) => {
            if (locked) {
              e.preventDefault();
              return;
            }
            onSubmit(e);
          }}
        >
          <input
            name="guess"
            value={guess}
            onChange={(e) => onGuessChange(e.target.value)}
            placeholder="Mit látsz a képen ?"
            className="guess-faint-input min-w-0 flex-1"
            autoComplete="off"
            disabled={locked}
            readOnly={locked}
          />
          <button type="submit" className="guess-faint-btn" disabled={locked}>
            Küldés
          </button>
          <button
            type="button"
            className="guess-faint-btn guess-faint-btn--pass"
            onClick={onPass}
            disabled={locked}
          >
            Passz
          </button>
        </form>

        <div className="guess-top-bar__feedback" aria-live="polite">
          <p className="guess-top-bar__reward">
            <strong>{formatPoints(potentialPoints)}</strong>
            <span className="guess-top-bar__reward-unit"> pont</span>
            <span
              className="guess-top-bar__grace"
              style={{ visibility: inGrace ? "visible" : "hidden" }}
              aria-hidden={!inGrace}
            >
              {" "}
              · betű {formatCountdown(remainingGrace)} mp múlva
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
