import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ModeToggle, type AppMode } from "../components/shell/ModeToggle";
import { PuzzleBoard } from "../components/play/PuzzleBoard";
import { usePlaySession } from "../components/play/usePlaySession";
import "../components/play/play-screen.css";

type PlayScreenProps = {
  onScored: () => void;
  onModeChange: (mode: AppMode) => void;
};

export function PlayScreen({ onScored, onModeChange }: PlayScreenProps) {
  const session = usePlaySession(onScored);

  const showGate =
    !session.roundActive &&
    !session.roundEnded &&
    session.prestartLeft == null &&
    !session.loading;

  if (session.loading) {
    return (
      <div className="play-screen">
        <div className="play-screen__mode-bar">
          <ModeToggle mode="play" onChange={onModeChange} />
        </div>
        <div className="play-screen play-screen--center">
          <Card padding="lg">
            <p className="play-screen__muted">Betöltés…</p>
          </Card>
        </div>
      </div>
    );
  }

  if (
    session.hasRequestedImage &&
    !session.current &&
    !session.loading
  ) {
    return (
      <div className="play-screen">
        <div className="play-screen__mode-bar">
          <ModeToggle mode="play" onChange={onModeChange} />
        </div>
        <div className="play-screen play-screen--center">
          <Card padding="lg" className="play-screen__empty">
            <p className="play-screen__empty-title">Nincs új kép.</p>
            <p className="play-screen__muted">Addig rajzolj.</p>
            {session.error ? (
              <p className="play-screen__error">{session.error}</p>
            ) : null}
            <Button
              label="Kérem a képet!"
              variant="secondary"
              className="play-screen__refresh"
              onClick={session.handleRequestImage}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="play-screen">
      <div className="play-screen__mode-bar">
        <ModeToggle mode="play" onChange={onModeChange} />
      </div>
      {session.error && !session.roundActive ? (
        <p className="play-screen__error play-screen__error--banner">
          {session.error}
        </p>
      ) : null}
      <PuzzleBoard
        src={session.current?.imageDataUrl}
        authorAlias={session.current?.authorAlias}
        index={session.index}
        total={session.poolSize}
        hint={session.current?.hint1 ?? ""}
        hintRevealed={session.hintRevealed}
        hintsDisabled={session.locked}
        onRevealHint={() => void session.handleReveal()}
        guess={session.guess}
        wrongGuesses={session.wrongGuesses}
        guessLocked={session.locked}
        prestartLeft={session.prestartLeft}
        startBusy={session.startBusy}
        showGate={showGate}
        canRequestImage
        canMehet={Boolean(session.current) && session.awaitingMehet}
        onRequestImage={session.handleRequestImage}
        onMehet={session.handleMehet}
        elapsedMs={session.elapsedMs}
        letterMask={session.letterMask}
        potentialPoints={session.potentialPoints}
        onGuessChange={session.setGuess}
        onGuessSubmit={(e) => void session.handleGuess(e)}
        onPass={session.handlePass}
        result={session.result}
        onDismissWrong={session.dismissWrong}
      />
    </div>
  );
}
