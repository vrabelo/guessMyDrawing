import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PlayIntroCard } from "../components/play/PlayIntroCard";
import { PuzzleBoard } from "../components/play/PuzzleBoard";
import { usePlaySession } from "../components/play/usePlaySession";
import "../components/play/play-screen.css";

type PlayScreenProps = {
  onScored: () => void;
};

export function PlayScreen({ onScored }: PlayScreenProps) {
  const session = usePlaySession(onScored);

  if (!session.sessionStarted) {
    return (
      <div className="play-screen">
        <PlayIntroCard
          onStart={session.handleSessionStart}
          busy={session.loading}
        />
      </div>
    );
  }

  if (session.loading) {
    return (
      <div className="play-screen play-screen--center">
        <Card padding="lg">
          <p className="play-screen__muted">Betöltés…</p>
        </Card>
      </div>
    );
  }

  if (!session.current) {
    return (
      <div className="play-screen play-screen--center">
        <Card padding="lg" className="play-screen__empty">
          <p className="play-screen__empty-title">Nincs új kép.</p>
          <p className="play-screen__muted">Addig rajzolj.</p>
          {session.error ? (
            <p className="play-screen__error">{session.error}</p>
          ) : null}
          <Button
            label="Frissítés"
            variant="secondary"
            className="play-screen__refresh"
            onClick={() => void session.loadPool()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="play-screen">
      {session.error && !session.roundActive ? (
        <p className="play-screen__error play-screen__error--banner">
          {session.error}
        </p>
      ) : null}
      <PuzzleBoard
        src={session.current.imageDataUrl}
        authorAlias={session.current.authorAlias}
        index={session.index}
        total={session.poolSize}
        hint={session.current.hint1 ?? ""}
        hintRevealed={session.hintRevealed}
        hintsDisabled={session.locked}
        onRevealHint={() => void session.handleReveal()}
        guess={session.guess}
        wrongGuesses={session.wrongGuesses}
        guessLocked={session.locked}
        awaitingStart={!session.roundActive && !session.roundEnded}
        onStart={() => void session.handleStartRound()}
        startBusy={session.startBusy}
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
