import type { FormEvent } from "react";
import type { ProgressStatus } from "@tipp-my-draw/shared";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/TextField";

type GuessCardProps = {
  guess: string;
  attemptsLeft: number;
  locked: boolean;
  status: ProgressStatus | null;
  answer?: string;
  feedback: string;
  onGuessChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
};

export function GuessCard({
  guess,
  attemptsLeft,
  locked,
  status,
  answer,
  feedback,
  onGuessChange,
  onSubmit,
}: GuessCardProps) {
  return (
    <Card title="Tipp" padding="md">
      {status === "solved" ? (
        <p className="text-sm font-medium text-[var(--accent)]">
          Megfejtés: {answer ?? "—"}
        </p>
      ) : null}

      {status === "failed" ? (
        <p className="text-sm font-medium text-[var(--danger)]">
          Elfogyott a 3 tipp.
        </p>
      ) : null}

      {!locked ? (
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={onSubmit}
        >
          <TextField
            label="Ki van lerajzolva?"
            name="guess"
            value={guess}
            onChange={(e) => onGuessChange(e.target.value)}
            placeholder="Tippeld meg a nevet"
          />
          <Button label="Tippelek" variant="primary" type="submit" />
        </form>
      ) : null}

      {!locked ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {attemptsLeft} tipp lehetőség
        </p>
      ) : null}

      {feedback ? (
        <p className="mt-2 text-sm font-medium text-[var(--accent)]">
          {feedback}
        </p>
      ) : null}
    </Card>
  );
}
