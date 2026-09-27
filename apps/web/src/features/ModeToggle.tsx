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
    <div className="flex justify-center gap-3">
      {modes.map((m) => (
        <Button
          key={m.id}
          label={m.label}
          variant={mode === m.id ? "primary" : "secondary"}
          active={mode === m.id}
          onClick={() => onChange(m.id)}
        />
      ))}
    </div>
  );
}
