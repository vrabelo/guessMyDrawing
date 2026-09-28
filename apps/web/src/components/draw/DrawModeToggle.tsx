export type DrawMode = "guided" | "free";

type DrawModeToggleProps = {
  mode: DrawMode;
  disabled?: boolean;
  onChange: (mode: DrawMode) => void;
};

export function DrawModeToggle({
  mode,
  disabled = false,
  onChange,
}: DrawModeToggleProps) {
  return (
    <div className="draw-mode-toggle" role="tablist" aria-label="Rajz mód">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "guided"}
        className={[
          "draw-mode-toggle__btn",
          mode === "guided" ? "draw-mode-toggle__btn--active" : "",
        ].join(" ")}
        disabled={disabled}
        onClick={() => onChange("guided")}
      >
        Ajánlott
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "free"}
        className={[
          "draw-mode-toggle__btn",
          mode === "free" ? "draw-mode-toggle__btn--active" : "",
        ].join(" ")}
        disabled={disabled}
        onClick={() => onChange("free")}
      >
        Szabad rajz
      </button>
    </div>
  );
}
