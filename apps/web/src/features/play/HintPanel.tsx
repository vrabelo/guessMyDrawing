import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

type HintPanelProps = {
  hints: Record<1 | 2 | 3, string>;
  revealed: [boolean, boolean, boolean];
  disabled?: boolean;
  onReveal: (n: 1 | 2 | 3) => void;
};

export function HintPanel({
  hints,
  revealed,
  disabled = false,
  onReveal,
}: HintPanelProps) {
  return (
    <Card title="Hints" className="h-full" padding="md">
      <div className="flex flex-col gap-3">
        {([1, 2, 3] as const).map((n) => (
          <div
            key={n}
            className="flex h-24 w-full flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] p-3"
          >
            <Button
              label={`HINT ${n}`}
              variant={revealed[n - 1] ? "primary" : "secondary"}
              disabled={disabled || revealed[n - 1]}
              onClick={() => onReveal(n)}
              fullWidth
              className="!py-2"
            />
            <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-snug text-[var(--muted)]">
              {revealed[n - 1] ? hints[n] || "—" : "\u00a0"}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
