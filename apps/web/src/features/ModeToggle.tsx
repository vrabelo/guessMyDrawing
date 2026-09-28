import { Button } from "../components/ui/Button";

export type AppMode = "play" | "draw";

type ModeToggleProps = {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
};

const modes: { id: AppMode; label: string }[] = [
  { id: "play", label: "Játszom" },
  { id: "draw", label: "Rajzolok" },
];

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className={[
        "mx-auto flex w-fit shrink-0 gap-1 rounded-full p-1",
        "bg-[var(--panel)]/80 shadow-[0_0_30px_rgba(45,212,191,0.12)] ring-1 ring-white/10 backdrop-blur-sm",
      ].join(" ")}
      role="tablist"
      aria-label="Mód"
    >
      {modes.map((m) => (
        <Button
          key={m.id}
          label={m.label}
          role="tab"
          aria-selected={mode === m.id}
          variant={mode === m.id ? "primary" : "ghost"}
          active={mode === m.id}
          onClick={() => onChange(m.id)}
          className="!px-6 !py-2"
        />
      ))}
    </div>
  );
}
