import type { AppMode } from "./ModeToggle.types";

export type { AppMode };

type ModeToggleProps = {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
};

const modes: { id: AppMode; label: string }[] = [
  { id: "play", label: "Kitalálom" },
  { id: "draw", label: "Rajzolok" },
];

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className="mode-segment shrink-0"
      role="tablist"
      aria-label="Mód"
    >
      {modes.map((m) => {
        const selected = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className="mode-segment__btn"
            onClick={() => onChange(m.id)}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
