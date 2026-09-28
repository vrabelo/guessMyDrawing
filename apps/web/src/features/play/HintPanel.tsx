import { Button } from "../../components/ui/Button";

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
    <div className="flex w-44 shrink-0 flex-col justify-center gap-3">
      {([1, 2, 3] as const).map((n) => {
        const isOpen = revealed[n - 1];
        return (
          <Button
            key={n}
            label={isOpen ? hints[n] || "—" : `HINT ${n}`}
            variant={isOpen ? "primary" : "secondary"}
            disabled={disabled || isOpen}
            onClick={() => onReveal(n)}
            fullWidth
            className={[
              "!h-14 !rounded-2xl !px-3 !text-xs !leading-snug",
              isOpen ? "!opacity-90" : "",
            ].join(" ")}
            title={isOpen ? hints[n] : `HINT ${n}`}
          />
        );
      })}
    </div>
  );
}
