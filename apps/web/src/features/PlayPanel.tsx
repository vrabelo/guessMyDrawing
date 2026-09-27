import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  AvailableDrawing,
  PublicDrawing,
  UserDrawingProgress,
} from "@tipp-my-draw/shared";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { api, createDrawingsSocket } from "../api/client";
import { HintPanel } from "./play/HintPanel";
import { PuzzleImageCard } from "./play/PuzzleImageCard";
import { GuessCard } from "./play/GuessCard";

type PlayPanelProps = {
  onScored: () => void;
};

const MAX_ATTEMPTS = 3;

function emptyHints(): [boolean, boolean, boolean] {
  return [false, false, false];
}

export function PlayPanel({ onScored }: PlayPanelProps) {
  const [pool, setPool] = useState<AvailableDrawing[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPool = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await api.availableDrawings();
      setPool(list);
      setIndex((i) => (list.length === 0 ? 0 : Math.min(i, list.length - 1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült betölteni.");
      setPool([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPool();
  }, [loadPool]);

  useEffect(() => {
    const ws = createDrawingsSocket((drawing: PublicDrawing) => {
      setPool((prev) => {
        if (prev.some((d) => d.id === drawing.id)) return prev;
        const next: AvailableDrawing = { ...drawing, progress: null };
        return [...prev, next];
      });
    });
    return () => {
      ws?.close();
    };
  }, []);

  const current = pool[index] ?? null;

  const progress: UserDrawingProgress | null = current?.progress ?? null;
  const status = progress?.status ?? null;
  const hintsRevealed = progress?.hintsRevealed ?? emptyHints();
  const attemptsUsed = progress?.attemptsUsed ?? 0;
  const attemptsLeft =
    status === "solved" || status === "failed"
      ? 0
      : MAX_ATTEMPTS - attemptsUsed;
  const locked = status === "solved" || status === "failed";

  const hintTexts = useMemo(
    () =>
      ({
        1: current?.hint1 ?? "",
        2: current?.hint2 ?? "",
        3: current?.hint3 ?? "",
      }) as Record<1 | 2 | 3, string>,
    [current]
  );

  function updateCurrentProgress(p: UserDrawingProgress, answer?: string) {
    setPool((prev) =>
      prev.map((d) =>
        d.id === p.drawingId
          ? {
              ...d,
              progress: p,
              ...(answer != null ? { answer } : {}),
            }
          : d
      )
    );
  }

  function removeFromPool(drawingId: string) {
    setPool((prev) => {
      const next = prev.filter((d) => d.id !== drawingId);
      setIndex((i) => {
        if (next.length === 0) return 0;
        return Math.min(i, next.length - 1);
      });
      return next;
    });
  }

  async function handleReveal(n: 1 | 2 | 3) {
    if (!current || locked || hintsRevealed[n - 1]) return;
    try {
      const p = await api.revealHint(current.id, n);
      updateCurrentProgress(p);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Hint mentés hiba.");
    }
  }

  async function handleGuess(e: FormEvent) {
    e.preventDefault();
    if (!current || locked || attemptsLeft <= 0) return;
    setFeedback("");
    try {
      const result = await api.guess(current.id, guess);
      updateCurrentProgress(result.progress, result.answer);
      setGuess("");
      if (result.correct) {
        setFeedback(
          result.pointsAwarded != null
            ? `Talált! ${result.pointsAwarded} -pont!`
            : result.message
        );
        onScored();
        window.setTimeout(() => removeFromPool(current.id), 1200);
      } else {
        setFeedback(
          result.attemptsLeft > 0
            ? `${result.attemptsLeft} tipp lehetőség`
            : result.message
        );
        if (result.progress.status === "failed") {
          window.setTimeout(() => removeFromPool(current.id), 1200);
        }
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Hiba a tippelésnél.");
    }
  }

  function goPrev() {
    setFeedback("");
    setGuess("");
    setIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setFeedback("");
    setGuess("");
    setIndex((i) => Math.min(pool.length - 1, i + 1));
  }

  if (loading) {
    return (
      <Card padding="lg">
        <p className="text-sm text-[var(--muted)]">Betöltés…</p>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-base font-medium text-[var(--ink)]">
          Jelenleg nincs új feladvány. Addig rajzolj.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
        ) : null}
        <Button
          label="Frissítés"
          variant="secondary"
          className="mt-4"
          onClick={() => void loadPool()}
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <HintPanel
          hints={hintTexts}
          revealed={hintsRevealed}
          disabled={locked}
          onReveal={(n) => void handleReveal(n)}
        />
        <PuzzleImageCard
          src={current.imageDataUrl}
          authorAlias={current.authorAlias}
          index={index}
          total={pool.length}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      <GuessCard
        guess={guess}
        attemptsLeft={attemptsLeft}
        locked={locked}
        status={status}
        answer={current.answer}
        feedback={feedback}
        onGuessChange={setGuess}
        onSubmit={(e) => void handleGuess(e)}
      />
    </div>
  );
}
