import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { PublicDrawing } from "@tipp-my-draw/shared";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { api } from "../api/client";

type PlayPanelProps = {
  onScored: () => void;
};

const MAX_ATTEMPTS = 3;

export function PlayPanel({ onScored }: PlayPanelProps) {
  const [drawing, setDrawing] = useState<PublicDrawing | null>(null);
  const [error, setError] = useState("");
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [revealed, setRevealed] = useState<Record<1 | 2 | 3, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const loadRandom = useCallback(async () => {
    setError("");
    setFeedback("");
    setGuess("");
    setAttemptsLeft(MAX_ATTEMPTS);
    setRevealed({ 1: false, 2: false, 3: false });
    try {
      const d = await api.randomDrawing();
      setDrawing(d);
    } catch (err) {
      setDrawing(null);
      setError(err instanceof Error ? err.message : "Nem sikerült betölteni.");
    }
  }, []);

  useEffect(() => {
    void loadRandom();
  }, [loadRandom]);

  const hints: Record<1 | 2 | 3, string> = {
    1: drawing?.hint1 ?? "",
    2: drawing?.hint2 ?? "",
    3: drawing?.hint3 ?? "",
  };

  const hintsUsed = ([1, 2, 3] as const).filter((n) => revealed[n]).length;

  async function handleGuess(e: FormEvent) {
    e.preventDefault();
    if (!drawing || attemptsLeft <= 0) return;
    setFeedback("");
    try {
      const result = await api.guess(drawing.id, guess, hintsUsed);
      setAttemptsLeft(result.attemptsLeft);
      if (result.correct) {
        setFeedback(
          result.pointsAwarded != null
            ? `Talált! ${result.pointsAwarded} -pont!`
            : result.message
        );
        onScored();
      } else {
        setFeedback(
          result.attemptsLeft > 0
            ? `${result.attemptsLeft} tipp lehetőség`
            : result.message
        );
        if (result.attemptsLeft <= 0) {
          window.setTimeout(() => {
            void loadRandom();
          }, 1200);
        }
      }
      setGuess("");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Hiba a tippelésnél.");
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      {drawing ? (
        <>
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div className="flex flex-col gap-2">
              {([1, 2, 3] as const).map((n) => (
                <div key={n} className="flex flex-col gap-1">
                  <Button
                    label={`HINT ${n}`}
                    variant="secondary"
                    onClick={() =>
                      setRevealed((prev) => ({ ...prev, [n]: true }))
                    }
                  />
                  {revealed[n] ? (
                    <p className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-700">
                      {hints[n] || "—"}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white p-2">
              <img
                src={drawing.imageDataUrl}
                alt="Rejtett rajz"
                className="max-h-64 max-w-full object-contain"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-stone-400">
            Rajzoló: {drawing.authorAlias}
          </p>

          <form
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={handleGuess}
          >
            <TextField
              label="Ki van lerajzolva?"
              name="guess"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Tippeld meg a nevet"
              disabled={attemptsLeft <= 0}
            />
            <Button
              label="Tippelek"
              variant="primary"
              type="submit"
              disabled={attemptsLeft <= 0}
            />
            <Button
              label="Új rajz"
              variant="ghost"
              onClick={() => void loadRandom()}
            />
          </form>

          <p className="mt-2 text-sm text-stone-600">
            {attemptsLeft} tipp lehetőség
          </p>

          {feedback ? (
            <p className="mt-1 text-sm font-medium text-[var(--accent)]">
              {feedback}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
