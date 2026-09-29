import { useState } from "react";
import { Button } from "../ui/Button";

type DrawIntroModalProps = {
  open: boolean;
  onConfirm: (dontShowAgain: boolean) => void;
};

export function DrawIntroModal({ open, onConfirm }: DrawIntroModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draw-intro-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel-solid)] p-5 shadow-xl">
        <h2
          id="draw-intro-title"
          className="mb-2 text-lg font-semibold text-[var(--ink)]"
        >
          Rajzolás
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-[var(--muted-strong)]">
          Rajzoláskor választhatsz szabad rajzolás vagy témakörök alapján egy
          véletlenszerű feladvány között.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-[var(--muted-strong)]">
          Az Oké után egy ablakban indíthatod a rajzolást. Új rajzzal a számláló
          és a téma is újraindul. Kategóriát vagy szabad rajzot választhatsz — 2
          perced van; később nem folytatható.
        </p>
        <label className="mb-5 flex cursor-pointer items-start gap-2.5 text-sm text-[var(--muted-strong)]">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <span>Ne jelenjen meg többet</span>
        </label>
        <Button
          label="Oké"
          variant="primary"
          fullWidth
          onClick={() => onConfirm(dontShowAgain)}
        />
      </div>
    </div>
  );
}
