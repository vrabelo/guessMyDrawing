import { GameDialog } from "../game/GameDialog";

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
  return (
    <GameDialog
      open={open}
      title="Képes feladvány"
      body={<p>Kérj egy képet a tippeléshez.</p>}
      primaryLabel="Kérem a képet!"
      primaryDisabled={busy}
      onPrimary={onStart}
      ariaLabel="Kép kérése"
    />
  );
}
