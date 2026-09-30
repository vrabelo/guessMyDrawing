type HintPanelProps = {
  hint: string;
  revealed: boolean;
  disabled?: boolean;
  onReveal: () => void;
  letterMask?: string | null;
  wrongGuesses?: string[];
};

function LetterMaskSlots({ mask }: { mask: string | null }) {
  if (mask == null) {
    return (
      <div className="play-guess-info__letter-mask" aria-label="Betűsegítség">
        <span className="play-guess-info__slot play-guess-info__slot--empty">
          …
        </span>
      </div>
    );
  }

  const chars = [...mask];
  return (
    <div className="play-guess-info__letter-mask" aria-label="Betűsegítség">
      {chars.map((ch, i) => {
        if (ch === " ") {
          return (
            <span
              key={`gap-${i}`}
              className="play-guess-info__slot play-guess-info__slot--gap"
              aria-hidden
            />
          );
        }
        return (
          <span
            key={`ch-${i}`}
            className={[
              "play-guess-info__slot",
              ch === "_" ? "play-guess-info__slot--empty" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export function HintPanel({
  hint,
  revealed,
  disabled = false,
  onReveal,
  letterMask = null,
  wrongGuesses = [],
}: HintPanelProps) {
  const label = revealed ? hint || "—" : "HINT";

  return (
    <div className="play-guess-info">
      <div className="play-guess-info__hint" aria-label="Hint">
        <p className="play-guess-info__caption">Húzd a körre a segítséghez!</p>
        {revealed ? (
          <div
            className="hint-morph hint-morph--play hint-morph--open hint-revealed"
            title={hint}
          >
            <span className="hint-morph__dot" aria-hidden>
              1
            </span>
            <span className="hint-morph__label">{label}</span>
          </div>
        ) : (
          <button
            type="button"
            className="hint-morph hint-morph--play"
            disabled={disabled}
            onClick={onReveal}
            title="HINT"
            aria-label="Hint felfedése"
          >
            <span className="hint-morph__dot" aria-hidden>
              1
            </span>
            <span className="hint-morph__label">{label}</span>
          </button>
        )}
      </div>

      <div className="play-guess-info__answer">
        <p className="play-guess-info__caption">megfejtés</p>
        <LetterMaskSlots mask={letterMask} />
        {wrongGuesses.length > 0 ? (
          <div className="play-guess-info__wrongs" aria-label="Rossz tippek">
            {wrongGuesses.map((w, i) => (
              <span key={`${w}-${i}`} className="guess-float__chip" title={w}>
                {w}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
