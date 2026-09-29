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
  const activeIndex = mode === "play" ? 0 : 1;

  return (
    <div
      className="mode-segment mx-auto shrink-0"
      role="tablist"
      aria-label="Mód"
    >
      <div
        className="mode-segment__thumb"
        style={{
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
        aria-hidden
      />
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
