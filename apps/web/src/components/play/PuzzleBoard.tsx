import type { FormEvent, ReactNode } from "react";
import { HintPanel } from "./HintPanel";
import { GuessCard } from "./GuessCard";
import { PlaySideRail } from "./PlaySideRail";
import { ResultOverlay, type ResultOverlayState } from "./ResultOverlay";

type PuzzleBoardProps = {
  src: string;
  authorAlias: string;
  index: number;
  total: number;
  hint: string;
  hintRevealed: boolean;
  hintsDisabled?: boolean;
  onRevealHint: () => void;
  guess: string;
  wrongGuesses: string[];
  guessLocked: boolean;
  /** Round has not started — show Mehet overlay, hide live guess UI. */
  awaitingStart?: boolean;
  onStart?: () => void;
  startBusy?: boolean;
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
  authorAlias,
  index,
  total,
  hint,
  hintRevealed,
  hintsDisabled = false,
  onRevealHint,
  guess,
  wrongGuesses,
  guessLocked,
  awaitingStart = false,
  onStart,
  startBusy = false,
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
  const showGuess = !guessLocked && !awaitingStart && !roundOver;

  return (
    <div className="play-stage flex h-full min-h-0 w-full gap-2">
      <PlaySideRail />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
        <div className="theme-row shrink-0">
          <p className="theme-row__intro">
            Találd ki mit rajzoltam és gyűjtsd a pontokat!
          </p>
        </div>

        <div className="game-card relative min-h-0 flex-1 overflow-hidden p-1.5">
          <div className="canvas-stage canvas-stage--landscape relative h-full min-h-0 w-full overflow-hidden">
            <img
              src={src}
              alt="Feladvány"
              className={[
                "canvas-stage__img",
                awaitingStart ? "canvas-stage__img--awaiting" : "",
              ].join(" ")}
            />

            {!awaitingStart ? (
              <div className="play-guess-overlay absolute inset-x-0 top-0 z-20">
                {showGuess ? (
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
                ) : (
                  <div
                    className="guess-top-bar guess-top-bar--spacer"
                    aria-hidden
                  />
                )}

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
            ) : null}

            <div className="pointer-events-none absolute right-2 bottom-2 z-10 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-md">
              <p className="text-[11px] font-medium tracking-wide text-white/85">
                @{authorAlias} · {index + 1}/{total}
              </p>
            </div>

            {awaitingStart ? (
              <div
                className="result-overlay absolute inset-0 z-30 flex items-center justify-center p-4"
                role="dialog"
                aria-label="Kör indítása"
              >
                <div className="result-overlay__card flex max-w-sm flex-col items-center gap-4 px-7 py-6 text-center">
                  <p className="text-base font-semibold text-[var(--ink)]">
                    Készen állsz a tippelésre?
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    A visszaszámláló a Mehet gombra indul.
                  </p>
                  <button
                    type="button"
                    className="guess-faint-btn guess-faint-btn--go"
                    disabled={startBusy}
                    onClick={onStart}
                  >
                    Mehet!
                  </button>
                </div>
              </div>
            ) : null}

            <ResultOverlay result={result} onDismissWrong={onDismissWrong} />
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
