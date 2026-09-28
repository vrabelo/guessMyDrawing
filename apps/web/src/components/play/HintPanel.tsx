type HintPanelProps = {
  hint: string;
  revealed: boolean;
  disabled?: boolean;
  onReveal: () => void;
  wrongGuesses?: string[];
};

export function HintPanel({
  hint,
  revealed,
  disabled = false,
  onReveal,
  wrongGuesses = [],
}: HintPanelProps) {
  const label = revealed ? hint || "—" : "HINT";

  return (
    <div className="hint-wrong-row">
      <div className="hint-float-stack" aria-label="Hint">
        {revealed ? (
          <div
            className="hint-morph hint-morph--open hint-revealed"
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
            className="hint-morph"
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

      {wrongGuesses.length > 0 ? (
        <div className="hint-wrong-row__wrongs" aria-label="Rossz tippek">
          {wrongGuesses.map((w, i) => (
            <span key={`${w}-${i}`} className="guess-float__chip" title={w}>
              {w}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
