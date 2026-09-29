import { GameDialog } from "../game/GameDialog";

export type ResultOverlayState =
  | { kind: "success"; points: number; elapsedMs: number }
  | { kind: "failure" }
  | { kind: "expired"; answer: string }
  | { kind: "wrong"; guess: string }
  | { kind: "pass" }
  | null;

type ResultOverlayProps = {
  result: ResultOverlayState;
  onDismissWrong?: () => void;
  /** Ok on terminal outcomes (success / failure / expired / pass). */
  onContinue?: () => void;
};

function formatPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

function formatSeconds(ms: number): string {
  const s = Math.max(0, ms / 1000);
  return Number.isInteger(s) ? String(s) : s.toFixed(1).replace(".", ",");
}

export function ResultOverlay({
  result,
  onDismissWrong,
  onContinue,
}: ResultOverlayProps) {
  if (!result) return null;

  if (result.kind === "wrong") {
    return (
      <GameDialog
        open
        title="Rossz tipp"
        tone="danger"
        body={<p>„{result.guess}” nem a megfejtés.</p>}
        primaryLabel="Rendben"
        onPrimary={() => onDismissWrong?.()}
        ariaLabel="Rossz tipp"
      />
    );
  }

  if (result.kind === "success") {
    return (
      <GameDialog
        open
        title="Eltaláltad!"
        tone="success"
        body={
          <p>
            {formatSeconds(result.elapsedMs)} másodperc alatt{" "}
            {formatPoints(result.points)} pont jóváírva.
          </p>
        }
        primaryLabel="Ok"
        onPrimary={() => onContinue?.()}
        ariaLabel="Sikeres tipp"
      />
    );
  }

  if (result.kind === "pass") {
    return (
      <GameDialog
        open
        title="Passz"
        body={<p>Átugrottad ezt a képet. Később újra előjöhet.</p>}
        primaryLabel="Ok"
        onPrimary={() => onContinue?.()}
        ariaLabel="Passz"
      />
    );
  }

  if (result.kind === "expired") {
    return (
      <GameDialog
        open
        title="Idő lejárt"
        tone="danger"
        body={<p>A teljes megfejtés: „{result.answer}”</p>}
        primaryLabel="Ok"
        onPrimary={() => onContinue?.()}
        ariaLabel="Idő lejárt"
      />
    );
  }

  return (
    <GameDialog
      open
      title="Nem talált"
      tone="danger"
      body={
        <p>
          Sajnos nem talált. Következő körben csak fél pontot kaphatsz a
          képért.
        </p>
      }
      primaryLabel="Ok"
      onPrimary={() => onContinue?.()}
      ariaLabel="Sikertelen tipp"
    />
  );
}
