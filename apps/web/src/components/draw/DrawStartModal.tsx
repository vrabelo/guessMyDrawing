import { Button } from "../ui/Button";

type DrawStartModalProps = {
  open: boolean;
  themeLabel: string;
  busy?: boolean;
  onStart: () => void;
};

export function DrawStartModal({
  open,
  themeLabel,
  busy = false,
  onStart,
}: DrawStartModalProps) {
  if (!open) return null;

  return (
    <div
      className="draw-start-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draw-start-title"
    >
      <div className="draw-start-overlay__card">
        <h2 id="draw-start-title" className="draw-start-overlay__title">
          Válaszd ki a rajzolni kívánt témát.
        </h2>
        <p className="draw-start-overlay__theme">
          Jelenlegi téma: &ldquo;{themeLabel}&rdquo;
        </p>
        <p className="draw-start-overlay__text">
          Ha készen állsz nyomd meg a gombot.
        </p>
        <p className="draw-start-overlay__text draw-start-overlay__text--last">
          Két perced lesz megrajzolni.
        </p>
        <Button
          label="Indulhat"
          variant="primary"
          fullWidth
          disabled={busy}
          onClick={onStart}
        />
      </div>
    </div>
  );
}
