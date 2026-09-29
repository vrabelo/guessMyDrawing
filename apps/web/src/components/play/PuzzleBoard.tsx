import type { FormEvent, ReactNode } from "react";
import { HintPanel } from "./HintPanel";
import { GuessCard } from "./GuessCard";
import { PlaySideRail } from "./PlaySideRail";
import { ResultOverlay, type ResultOverlayState } from "./ResultOverlay";

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
  /** Show Kérem a képet / Mehet gate overlay. */
  showGate?: boolean;
  canRequestImage?: boolean;
  canMehet?: boolean;
  onRequestImage?: () => void;
  onMehet?: () => void;
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
  showGate = false,
  canRequestImage = false,
  canMehet = false,
  onRequestImage,
  onMehet,
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
  const imageDimmed = awaitingCountdown || showGate;
  const showGuess =
    !guessLocked && !awaitingCountdown && !showGate && !roundOver && Boolean(src);

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
            {src ? (
              <img
                src={src}
                alt="Feladvány"
                className={[
                  "canvas-stage__img",
                  imageDimmed ? "canvas-stage__img--awaiting" : "",
                ].join(" ")}
              />
            ) : (
              <div className="canvas-stage__img canvas-stage__img--awaiting flex h-full w-full items-center justify-center bg-black/40" />
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
            ) : !showGate && !awaitingCountdown ? (
              <div className="play-guess-overlay absolute inset-x-0 top-0 z-20">
                <div className="guess-top-bar guess-top-bar--spacer" aria-hidden />
              </div>
            ) : null}

            {src && authorAlias ? (
              <div className="pointer-events-none absolute right-2 bottom-2 z-10 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-md">
                <p className="text-[11px] font-medium tracking-wide text-white/85">
                  @{authorAlias} · {index + 1}/{total}
                </p>
              </div>
            ) : null}

            {showGate ? (
              <div className="play-gate" role="dialog" aria-label="Kör indítása">
                <div className="play-gate__actions">
                  <button
                    type="button"
                    className="guess-faint-btn guess-faint-btn--go"
                    disabled={!canRequestImage || startBusy}
                    onClick={onRequestImage}
                  >
                    Kérem a képet!
                  </button>
                  <button
                    type="button"
                    className="guess-faint-btn guess-faint-btn--go"
                    disabled={!canMehet || startBusy}
                    onClick={onMehet}
                  >
                    Mehet!
                  </button>
                </div>
              </div>
            ) : null}

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
        </div>
      </div>
    </div>
  );
}
