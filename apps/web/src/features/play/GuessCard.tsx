import type { FormEvent } from "react";
import type { ProgressStatus } from "@tipp-my-draw/shared";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/TextField";

type GuessCardProps = {
  guess: string;
  wrongGuesses: string[];
  locked: boolean;
  status: ProgressStatus | null;
  answer?: string;
  feedback: string;
  onGuessChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function GuessCard({
  guess,
  wrongGuesses,
  locked,
  status,
  answer,
  feedback,
  onGuessChange,
  onSubmit,
}: GuessCardProps) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {wrongGuesses.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className={[
              "inline-flex h-11 max-w-[10rem] items-center truncate rounded-2xl px-4 text-sm",
              "bg-[#3f1d1d] text-[#fca5a5] ring-1 ring-[#7f1d1d]/60",
              "shadow-md shadow-black/30",
            ].join(" ")}
            title={w}
          >
            {w}
          </span>
        ))}

        {!locked ? (
          <form className="flex flex-wrap items-end gap-2" onSubmit={onSubmit}>
            <div className="min-w-[12rem] flex-1">
              <TextField
                name="guess"
                value={guess}
                onChange={(e) => onGuessChange(e.target.value)}
                placeholder="Tipp…"
                className="shadow-lg shadow-black/25"
              />
            </div>
            <Button
              label="Küldés"
              variant="primary"
              type="submit"
              className="shadow-lg shadow-black/30"
            />
          </form>
        ) : null}
      </div>

      {status === "solved" ? (
        <p className="mt-3 text-sm font-medium text-[var(--accent)]">
          Megfejtés: {answer ?? "—"}
        </p>
      ) : null}

      {status === "failed" ? (
        <p className="mt-3 text-sm font-medium text-[var(--danger)]">
          Elfogyott a 3 tipp.
        </p>
      ) : null}

      {feedback ? (
        <p className="mt-2 text-sm font-medium text-[var(--accent)]">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
