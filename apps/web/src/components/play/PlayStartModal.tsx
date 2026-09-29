import { Button } from "../ui/Button";

type PlayStartModalProps = {
  open: boolean;
  busy?: boolean;
  onStart: () => void;
};

export function PlayStartModal({
  open,
  busy = false,
  onStart,
}: PlayStartModalProps) {
  if (!open) return null;

  return (
    <div
      className="play-start-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Kép kérése"
    >
      <Button
        label="Kérem a képet!"
        variant="primary"
        disabled={busy}
        onClick={onStart}
      />
    </div>
  );
}
