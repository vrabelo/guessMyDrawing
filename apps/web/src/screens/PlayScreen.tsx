import type {
  LeaderboardsResponse,
  UserStatsResponse,
} from "@tipp-my-draw/shared";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ModeToggle, type AppMode } from "../components/shell/ModeToggle";
import { SidePanel } from "../components/shell/SidePanel";
import { PuzzleBoard } from "../components/play/PuzzleBoard";
import { usePlaySession } from "../components/play/usePlaySession";
import "../components/draw/draw-screen.css";
import "../components/play/play-screen.css";

type PlayScreenProps = {
  onScored: () => void;
  onModeChange: (mode: AppMode) => void;
  alias: string;
  stats: UserStatsResponse | null;
  boards: LeaderboardsResponse | null;
};

export function PlayScreen({
  onScored,
  onModeChange,
  alias,
  stats,
  boards,
}: PlayScreenProps) {
  const session = usePlaySession(onScored);

  const showStartModal =
    !session.hasRequestedImage &&
    !session.roundActive &&
    session.prestartLeft == null &&
    !session.loading;

  /** Only show the puzzle image during an active round — no preview, no blur. */
  const puzzleSrc = session.roundActive
    ? session.current?.imageDataUrl
    : undefined;

  const board =
    session.hasRequestedImage && !session.current && !session.loading ? (
      <div className="draw-screen__canvas play-board play-board--center">
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
            onClick={() => void session.handleIndulhat()}
          />
        </Card>
      </div>
    ) : (
      <>
        {session.error && !session.roundActive ? (
          <p className="play-screen__error play-screen__error--banner">
            {session.error}
          </p>
        ) : null}
        <PuzzleBoard
          src={puzzleSrc}
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
          startBusy={session.startBusy || session.loading}
          showStartModal={showStartModal}
          onIndulhat={() => void session.handleIndulhat()}
          elapsedMs={session.elapsedMs}
          letterMask={session.letterMask}
          potentialPoints={session.potentialPoints}
          onGuessChange={session.setGuess}
          onGuessSubmit={(e) => void session.handleGuess(e)}
          onPass={session.handlePass}
          result={session.result}
          onDismissWrong={session.dismissWrong}
          onContinueResult={session.dismissResultAndContinue}
        />
      </>
    );

  return (
    <div className="draw-workspace draw-screen">
      <div className="draw-screen__main">
        <div className="draw-screen__toolbar">
          <ModeToggle mode="play" onChange={onModeChange} />
          <div className="draw-screen__theme-center" aria-hidden />
        </div>
        {board}
      </div>

      <div className="draw-screen__side">
        <SidePanel alias={alias} stats={stats} boards={boards} />
      </div>
    </div>
  );
}
