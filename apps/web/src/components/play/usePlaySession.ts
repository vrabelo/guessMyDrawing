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
  MAX_ATTEMPTS,
  PASS_OVERLAY_MS,
  PRESTART_SECONDS,
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
  const [pool, setPool] = useState<AvailableDrawing[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [guess, setGuess] = useState("");
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRequestedImage, setHasRequestedImage] = useState(false);
  const [needsStartConfirm, setNeedsStartConfirm] = useState(false);
  const [result, setResult] = useState<ResultOverlayState>(null);
  const [now, setNow] = useState(() => Date.now());
  const [revealAnswer, setRevealAnswer] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [startBusy, setStartBusy] = useState(false);
  const [prestartLeft, setPrestartLeft] = useState<number | null>(null);
  const wrongTimerRef = useRef<number | null>(null);
  const passTimerRef = useRef<number | null>(null);
  const fetchingAnswerRef = useRef(false);
  const expireHandledRef = useRef(false);
  const startRoundRef = useRef<() => Promise<void>>(async () => {});
  const dismissContinueRef = useRef<() => void>(() => {});
  const pendingPrestartRef = useRef(false);

  const loadPool = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await api.availableDrawings();
      setPool(list);
      setIndex(list.length === 0 ? 0 : pickRandomIndex(list.length));
      setRoundActive(false);
      setPrestartLeft(null);
      setHasRequestedImage(true);
      setNeedsStartConfirm(list.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült betölteni.");
      setPool([]);
      setHasRequestedImage(true);
      setNeedsStartConfirm(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ws = createDrawingsSocket((drawing: PublicDrawing) => {
      setPool((prev) => {
        if (prev.some((d) => d.id === drawing.id)) return prev;
        const next: AvailableDrawing = { ...drawing, progress: null };
        const wasEmpty = prev.length === 0;
        const updated = [...prev, next];
        if (wasEmpty && hasRequestedImage) {
          setIndex(0);
          setRoundActive(false);
          setPrestartLeft(null);
          setNeedsStartConfirm(true);
        }
        return updated;
      });
    });
    return () => {
      ws?.close();
    };
  }, [hasRequestedImage]);

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
    if (passTimerRef.current != null) {
      window.clearTimeout(passTimerRef.current);
      passTimerRef.current = null;
    }
    if (pendingPrestartRef.current && currentId) {
      pendingPrestartRef.current = false;
      setPrestartLeft(PRESTART_SECONDS);
    } else if (!pendingPrestartRef.current) {
      setPrestartLeft(null);
    }
  }, [currentId]);

  useEffect(() => {
    return () => {
      if (wrongTimerRef.current != null) {
        window.clearTimeout(wrongTimerRef.current);
      }
      if (passTimerRef.current != null) {
        window.clearTimeout(passTimerRef.current);
      }
    };
  }, []);

  const progress: UserDrawingProgress | null = current?.progress ?? null;
  const status = progress?.status ?? null;
  const hintsRevealed = progress?.hintsRevealed ?? emptyHints();
  const hintRevealed = Boolean(hintsRevealed[0]);
  const attemptsUsed = progress?.attemptsUsed ?? 0;
  const attemptsLeft =
    status === "solved" || status === "failed"
      ? 0
      : MAX_ATTEMPTS - attemptsUsed;
  const roundEnded =
    status === "solved" ||
    status === "failed" ||
    result?.kind === "success" ||
    result?.kind === "failure" ||
    result?.kind === "expired" ||
    result?.kind === "pass";
  const locked = roundEnded || !roundActive;
  const priorFailure = Boolean(progress?.priorFailure);

  const awaitingImage =
    !hasRequestedImage ||
    (hasRequestedImage && !loading && !current && !error);
  const awaitingMehet =
    hasRequestedImage &&
    Boolean(current) &&
    !roundActive &&
    !roundEnded &&
    prestartLeft == null;

  function clearPassTimer() {
    if (passTimerRef.current != null) {
      window.clearTimeout(passTimerRef.current);
      passTimerRef.current = null;
    }
  }

  function handleRequestImage() {
    void loadPool();
  }

  function handleMehet() {
    if (!current || roundActive || roundEnded || startBusy) return;
    setNeedsStartConfirm(false);
    setPrestartLeft(PRESTART_SECONDS);
  }

  /** Load pool if needed, then start prestart when a drawing is available. */
  async function handleIndulhat() {
    if (roundActive || roundEnded || startBusy || prestartLeft != null) return;

    if (current && hasRequestedImage) {
      setNeedsStartConfirm(false);
      setPrestartLeft(PRESTART_SECONDS);
      return;
    }

    pendingPrestartRef.current = true;
    setLoading(true);
    setError("");
    try {
      const list = await api.availableDrawings();
      setPool(list);
      setHasRequestedImage(true);
      setRoundActive(false);
      if (list.length === 0) {
        pendingPrestartRef.current = false;
        setIndex(0);
        setPrestartLeft(null);
        setNeedsStartConfirm(false);
        return;
      }
      setNeedsStartConfirm(false);
      setIndex(pickRandomIndex(list.length));
      // prestart applied in currentId effect via pendingPrestartRef
    } catch (err) {
      pendingPrestartRef.current = false;
      setError(err instanceof Error ? err.message : "Nem sikerült betölteni.");
      setPool([]);
      setHasRequestedImage(true);
      setPrestartLeft(null);
      setNeedsStartConfirm(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartRound() {
    if (!current || roundActive || startBusy || roundEnded) return;
    setPrestartLeft(null);
    setNeedsStartConfirm(false);
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
      setPrestartLeft(null);
    } finally {
      setStartBusy(false);
    }
  }

  startRoundRef.current = handleStartRound;

  useEffect(() => {
    if (prestartLeft == null || roundActive || roundEnded || !currentId) return;
    if (prestartLeft <= 0) {
      void startRoundRef.current();
      return;
    }
    const tick = window.setTimeout(() => {
      setPrestartLeft((n) => (n == null ? null : n - 1));
    }, 1000);
    return () => window.clearTimeout(tick);
  }, [prestartLeft, roundActive, roundEnded, currentId]);

  useEffect(() => {
    if (!currentId || !roundActive || locked) return;
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(tick);
  }, [currentId, roundActive, locked]);

  const elapsedMs =
    roundActive && progress?.guessStartedAt != null && progress.guessStartedAt > 0
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

  /** Defer drawing (pass / expire): keep in pool, pick another if possible, then prestart. */
  function deferDrawingAndContinue(drawingId: string) {
    pendingPrestartRef.current = true;
    setPool((prev) => {
      if (prev.length === 0) {
        pendingPrestartRef.current = false;
        return prev;
      }
      const curIdx = prev.findIndex((d) => d.id === drawingId);
      const nextIdx = pickRandomIndex(prev.length, curIdx);
      setIndex(nextIdx);
      if (prev[nextIdx]?.id === drawingId) {
        pendingPrestartRef.current = false;
        setPrestartLeft(PRESTART_SECONDS);
      }
      return prev;
    });
  }

  /** After Ok on a terminal result: advance pool and start next prestart if any. */
  function dismissResultAndContinue() {
    if (!result || result.kind === "wrong") return;
    const drawingId = current?.id;
    const kind = result.kind;

    clearPassTimer();
    setResult(null);
    setRoundActive(false);
    setGuess("");
    dismissWrong();

    if ((kind === "pass" || kind === "expired") && drawingId) {
      deferDrawingAndContinue(drawingId);
      return;
    }

    if (!drawingId) return;

    pendingPrestartRef.current = true;
    setPool((prev) => {
      const next = prev.filter((d) => d.id !== drawingId);
      if (next.length === 0) {
        pendingPrestartRef.current = false;
        setIndex(0);
        setPrestartLeft(null);
        setNeedsStartConfirm(false);
        return next;
      }
      setIndex(pickRandomIndex(next.length));
      return next;
    });
  }

  dismissContinueRef.current = dismissResultAndContinue;

  useEffect(() => {
    if (!current || !roundActive || locked || !revealAnswer) return;
    if (expireHandledRef.current) return;
    if (!isAnswerFullyRevealed(revealAnswer, elapsedMs)) return;
    expireHandledRef.current = true;
    const drawingId = current.id;
    void api
      .expireDrawing(drawingId)
      .then((p) => {
        updateCurrentProgress(p);
      })
      .catch(() => {
        /* still show local result */
      })
      .finally(() => {
        setResult({ kind: "expired" });
      });
  }, [current, roundActive, locked, revealAnswer, elapsedMs]);

  useEffect(() => {
    if (result?.kind !== "pass") {
      clearPassTimer();
      return;
    }
    clearPassTimer();
    passTimerRef.current = window.setTimeout(() => {
      passTimerRef.current = null;
      dismissContinueRef.current();
    }, PASS_OVERLAY_MS);
    return () => clearPassTimer();
  }, [result]);

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
    setResult({ kind: "pass" });
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
          elapsedMs,
        });
        onScored();
        return;
      }

      if (!res.correct) {
        setWrongGuesses((prev) => [...prev, submitted]);
        if (res.roundComplete) {
          dismissWrong();
          setResult({ kind: "failure" });
          onScored();
        } else {
          showWrongOverlay(submitted);
        }
      }
    } catch {
      /* ignore */
    }
  }

  return {
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
    prestartLeft,
    hasRequestedImage,
    needsStartConfirm,
    awaitingImage,
    awaitingMehet,
    elapsedMs,
    letterMask,
    potentialPoints,
    loadPool,
    handleRequestImage,
    handleMehet,
    handleIndulhat,
    handlePass,
    handleReveal,
    handleGuess,
    setGuess,
    dismissWrong,
    dismissResultAndContinue,
  };
}
