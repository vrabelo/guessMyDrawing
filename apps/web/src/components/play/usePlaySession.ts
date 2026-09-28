import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type {
  AvailableDrawing,
  PublicDrawing,
  UserDrawingProgress,
} from "@tipp-my-draw/shared";
import {
  buildLetterMask,
  isAnswerFullyRevealed,
  letterRevealCount,
  potentialTipperPoints,
} from "@tipp-my-draw/shared";
import { api, createDrawingsSocket } from "../../api/client";
import type { ResultOverlayState } from "./ResultOverlay";
import {
  EXPIRE_OVERLAY_MS,
  MAX_ATTEMPTS,
  WRONG_OVERLAY_MS,
} from "./constants";

function emptyHints(): [boolean] {
  return [false];
}

function pickRandomIndex(length: number, exclude?: number): number {
  if (length <= 0) return 0;
  if (length === 1) return 0;
  if (exclude == null || exclude < 0 || exclude >= length) {
    return Math.floor(Math.random() * length);
  }
  let next = Math.floor(Math.random() * (length - 1));
  if (next >= exclude) next += 1;
  return next;
}

export function usePlaySession(onScored: () => void) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [pool, setPool] = useState<AvailableDrawing[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [guess, setGuess] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultOverlayState>(null);
  const [now, setNow] = useState(() => Date.now());
  const [revealAnswer, setRevealAnswer] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const wrongTimerRef = useRef<number | null>(null);
  const fetchingAnswerRef = useRef(false);
  const expireHandledRef = useRef(false);

  const loadPool = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await api.availableDrawings();
      setPool(list);
      setIndex(list.length === 0 ? 0 : pickRandomIndex(list.length));
      setRoundActive(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült betölteni.");
      setPool([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSessionStart() {
    setSessionStarted(true);
    void loadPool();
  }

  useEffect(() => {
    if (!sessionStarted) return;
    const ws = createDrawingsSocket((drawing: PublicDrawing) => {
      setPool((prev) => {
        if (prev.some((d) => d.id === drawing.id)) return prev;
        const next: AvailableDrawing = { ...drawing, progress: null };
        const wasEmpty = prev.length === 0;
        const updated = [...prev, next];
        if (wasEmpty) {
          setIndex(0);
          setRoundActive(false);
        }
        return updated;
      });
    });
    return () => {
      ws?.close();
    };
  }, [sessionStarted]);

  const current = pool[index] ?? null;
  const currentId = current?.id;

  useEffect(() => {
    setWrongGuesses([]);
    setGuess("");
    setResult(null);
    setRevealAnswer(null);
    setRoundActive(false);
    setStartBusy(false);
    fetchingAnswerRef.current = false;
    expireHandledRef.current = false;
    if (wrongTimerRef.current != null) {
      window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
  }, [currentId]);

  useEffect(() => {
    return () => {
      if (wrongTimerRef.current != null) {
        window.clearTimeout(wrongTimerRef.current);
      }
    };
  }, []);

  const progress: UserDrawingProgress | null = current?.progress ?? null;
  const status = progress?.status ?? null;
  const hintsRevealed = progress?.hintsRevealed ?? emptyHints();
  const hintRevealed = Boolean(hintsRevealed[0]);
  const attemptsUsed = progress?.attemptsUsed ?? 0;
  const attemptsLeft =
    status === "solved" || status === "failed" || status === "expired"
      ? 0
      : MAX_ATTEMPTS - attemptsUsed;
  const roundEnded =
    status === "solved" ||
    status === "failed" ||
    status === "expired" ||
    result?.kind === "success" ||
    result?.kind === "failure" ||
    result?.kind === "expired";
  const locked = roundEnded || !roundActive;
  const priorFailure = Boolean(progress?.priorFailure);

  async function handleStartRound() {
    if (!current || roundActive || startBusy || roundEnded) return;
    setStartBusy(true);
    setError("");
    try {
      const item = await api.startDrawingView(current.id);
      setPool((prev) =>
        prev.map((d) =>
          d.id === item.id
            ? {
                ...d,
                progress: item.progress,
                ...(item.answer != null ? { answer: item.answer } : {}),
              }
            : d
        )
      );
      setRoundActive(true);
      setNow(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült indítani.");
    } finally {
      setStartBusy(false);
    }
  }

  useEffect(() => {
    if (!currentId || !roundActive || locked) return;
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(tick);
  }, [currentId, roundActive, locked]);

  const elapsedMs =
    roundActive && progress?.guessStartedAt != null
      ? Math.max(0, now - progress.guessStartedAt)
      : 0;

  useEffect(() => {
    if (!currentId || !roundActive || locked || revealAnswer != null) return;
    if (fetchingAnswerRef.current) return;
    fetchingAnswerRef.current = true;
    void api
      .postBonusAnswer(currentId)
      .then((res) => {
        setRevealAnswer(res.answer);
      })
      .catch(() => {
        fetchingAnswerRef.current = false;
      });
  }, [currentId, roundActive, locked, revealAnswer]);

  const letterSeed = `${currentId ?? ""}:${progress?.guessStartedAt ?? 0}`;

  const letterMask = useMemo(() => {
    if (!roundActive || !revealAnswer) return null;
    return buildLetterMask(
      revealAnswer,
      letterRevealCount(elapsedMs),
      letterSeed
    );
  }, [roundActive, revealAnswer, elapsedMs, letterSeed]);

  const potentialPoints = potentialTipperPoints(
    hintsRevealed,
    priorFailure,
    elapsedMs
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
      setIndex(next.length === 0 ? 0 : pickRandomIndex(next.length));
      return next;
    });
    setResult(null);
    setRoundActive(false);
  }

  useEffect(() => {
    if (!current || !roundActive || locked || !revealAnswer) return;
    if (expireHandledRef.current) return;
    if (!isAnswerFullyRevealed(revealAnswer, elapsedMs)) return;
    expireHandledRef.current = true;
    const answer = revealAnswer;
    const drawingId = current.id;
    void api
      .expireDrawing(drawingId)
      .then((p) => {
        updateCurrentProgress(p, answer);
      })
      .catch(() => {
        /* still remove locally */
      })
      .finally(() => {
        setResult({ kind: "expired", answer });
        window.setTimeout(() => removeFromPool(drawingId), EXPIRE_OVERLAY_MS);
      });
  }, [current, roundActive, locked, revealAnswer, elapsedMs]);

  function dismissWrong() {
    if (wrongTimerRef.current != null) {
      window.clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
    setResult((prev) => (prev?.kind === "wrong" ? null : prev));
  }

  function showWrongOverlay(submitted: string) {
    if (wrongTimerRef.current != null) {
      window.clearTimeout(wrongTimerRef.current);
    }
    setResult({ kind: "wrong", guess: submitted });
    wrongTimerRef.current = window.setTimeout(() => {
      setResult((prev) => (prev?.kind === "wrong" ? null : prev));
      wrongTimerRef.current = null;
    }, WRONG_OVERLAY_MS);
  }

  function handlePass() {
    if (!current || locked) return;
    dismissWrong();
    setGuess("");
    removeFromPool(current.id);
  }

  async function handleReveal() {
    if (!current || locked || hintRevealed) return;
    try {
      const p = await api.revealHint(current.id);
      updateCurrentProgress(p);
    } catch {
      /* ignore */
    }
  }

  async function handleGuess(e: FormEvent) {
    e.preventDefault();
    if (!current || locked || attemptsLeft <= 0) return;
    const submitted = guess.trim();
    if (!submitted) return;
    try {
      const res = await api.guess(current.id, submitted);
      updateCurrentProgress(res.progress, res.answer);
      setGuess("");

      if (res.correct && res.roundComplete) {
        dismissWrong();
        setResult({
          kind: "success",
          points: res.pointsAwarded ?? 0,
        });
        onScored();
        window.setTimeout(() => removeFromPool(current.id), 2200);
        return;
      }

      if (!res.correct) {
        setWrongGuesses((prev) => [...prev, submitted]);
        if (res.roundComplete) {
          dismissWrong();
          setResult({ kind: "failure" });
          onScored();
          window.setTimeout(() => removeFromPool(current.id), 2800);
        } else {
          showWrongOverlay(submitted);
        }
      }
    } catch {
      /* ignore */
    }
  }

  return {
    sessionStarted,
    loading,
    error,
    current,
    index,
    poolSize: pool.length,
    guess,
    wrongGuesses,
    result,
    hintRevealed,
    locked,
    roundActive,
    roundEnded,
    startBusy,
    elapsedMs,
    letterMask,
    potentialPoints,
    handleSessionStart,
    loadPool,
    handleStartRound,
    handlePass,
    handleReveal,
    handleGuess,
    setGuess,
    dismissWrong,
  };
}
