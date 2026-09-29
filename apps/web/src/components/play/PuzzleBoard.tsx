import type { FormEvent, ReactNode } from "react";
import { HintPanel } from "./HintPanel";
import { GuessCard } from "./GuessCard";
import { ResultOverlay, type ResultOverlayState } from "./ResultOverlay";
import { PlayStartModal } from "./PlayStartModal";

type PuzzleBoardProps = {
  src?: string | null;
  authorAlias?: string;
  index: number;
  total: number;
  hint: string;
  hintRevealed: boolean;
  hintsDisabled?: boolean;
  onRevealHint: () => void;
  guess: string;
  wrongGuesses: string[];
  guessLocked: boolean;
  prestartLeft?: number | null;
  startBusy?: boolean;
  /** Show Kérem a képet start modal over the board. */
  showStartModal?: boolean;
  onIndulhat?: () => void;
  elapsedMs: number;
  letterMask: string | null;
  potentialPoints: number;
  onGuessChange: (value: string) => void;
  onGuessSubmit: (e: FormEvent) => void;
  onPass: () => void;
  result: ResultOverlayState;
  onDismissWrong?: () => void;
  footer?: ReactNode;
};

export function PuzzleBoard({
  src,
  authorAlias = "",
  index,
  total,
  hint,
  hintRevealed,
  hintsDisabled = false,
  onRevealHint,
  guess,
  wrongGuesses,
  guessLocked,
  prestartLeft = null,
  startBusy = false,
  showStartModal = false,
  onIndulhat,
  elapsedMs,
  letterMask,
  potentialPoints,
  onGuessChange,
  onGuessSubmit,
  onPass,
  result,
  onDismissWrong,
  footer,
}: PuzzleBoardProps) {
  const roundOver =
    result?.kind === "success" ||
    result?.kind === "failure" ||
    result?.kind === "expired";
  const awaitingCountdown = prestartLeft != null;
  const showImage = Boolean(src);
  const showGuess =
    !guessLocked &&
    !awaitingCountdown &&
    !showStartModal &&
    !roundOver &&
    showImage;

  return (
    <div
      className={[
        "draw-screen__canvas play-board",
        showImage ? "play-board--puzzle" : "play-board--idle",
      ].join(" ")}
    >
      {showImage ? (
        <div className="game-canvas-viewport-host play-board__viewport-host">
          <div className="game-canvas-viewport game-canvas-viewport--play">
            <img
              src={src!}
              alt="Feladvány"
              className="game-canvas-viewport__surface play-board__img"
            />
          </div>
        </div>
      ) : (
        <div
          className="play-board__placeholder"
          aria-hidden={showStartModal}
        />
      )}

      {showGuess ? (
        <div className="play-guess-overlay absolute inset-x-0 top-0 z-20">
          <GuessCard
            guess={guess}
            locked={false}
            elapsedMs={elapsedMs}
            letterMask={letterMask}
            potentialPoints={potentialPoints}
            onGuessChange={onGuessChange}
            onSubmit={onGuessSubmit}
            onPass={onPass}
          />
          <div className="play-guess-overlay__hints">
            <HintPanel
              hint={hint}
              revealed={hintRevealed}
              disabled={hintsDisabled || roundOver}
              onReveal={onRevealHint}
              wrongGuesses={wrongGuesses}
            />
          </div>
        </div>
      ) : !showStartModal && !awaitingCountdown ? (
        <div className="play-guess-overlay absolute inset-x-0 top-0 z-20">
          <div className="guess-top-bar guess-top-bar--spacer" aria-hidden />
        </div>
      ) : null}

      {showImage && authorAlias && !showStartModal && !awaitingCountdown ? (
        <div className="pointer-events-none absolute right-2 bottom-2 z-10 rounded-full bg-black/35 px-2.5 py-1">
          <p className="text-[11px] font-medium tracking-wide text-white/85">
            @{authorAlias} · {index + 1}/{total}
          </p>
        </div>
      ) : null}

      <PlayStartModal
        open={showStartModal}
        busy={startBusy}
        onStart={() => onIndulhat?.()}
      />

      {awaitingCountdown ? (
        <div
          className="prestart-countdown"
          role="status"
          aria-live="polite"
          aria-label={`Indulás ${prestartLeft} másodperc múlva`}
        >
          <span
            className={[
              "prestart-countdown__num",
              startBusy ? "prestart-countdown__num--busy" : "",
            ].join(" ")}
          >
            {prestartLeft}
          </span>
        </div>
      ) : null}

      <ResultOverlay result={result} onDismissWrong={onDismissWrong} />
      {footer}
    </div>
  );
}
