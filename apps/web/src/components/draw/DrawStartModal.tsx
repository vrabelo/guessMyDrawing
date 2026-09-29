import { GameDialog } from "../game/GameDialog";

type DrawStartModalProps = {
  open: boolean;
  themeLabel: string;
  busy?: boolean;
  onNewTheme: () => void;
  onStart: () => void;
};

export function DrawStartModal({
  open,
  themeLabel,
  busy = false,
  onNewTheme,
  onStart,
}: DrawStartModalProps) {
  return (
    <GameDialog
      open={open}
      title="Válaszd ki a rajzolni kívánt témát."
      body={
        <>
          <p>Jelenlegi téma: &ldquo;{themeLabel}&rdquo;</p>
          <p>Ha készen állsz, nyomd meg a gombot.</p>
          <p>Két perced lesz megrajzolni.</p>
        </>
      }
      secondaryLabel="Új téma"
      onSecondary={onNewTheme}
      secondaryDisabled={busy}
      primaryLabel="Indulhat"
      onPrimary={onStart}
      primaryDisabled={busy}
    />
  );
}
