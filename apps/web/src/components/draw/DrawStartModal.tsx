import { Button } from "../ui/Button";

type DrawStartModalProps = {
  open: boolean;
  busy?: boolean;
  onStart: () => void;
};

export function DrawStartModal({
  open,
  busy = false,
  onStart,
}: DrawStartModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draw-start-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel-solid)] p-5 shadow-xl">
        <h2
          id="draw-start-title"
          className="mb-3 text-lg font-semibold text-[var(--ink)]"
        >
          Rajzolás indítása
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-[var(--muted-strong)]">
          Ha készen állsz indítsd a rajzolást a gombbal.
        </p>
        <Button
          label="Indítás"
          variant="primary"
          fullWidth
          disabled={busy}
          onClick={onStart}
        />
      </div>
    </div>
  );
}
