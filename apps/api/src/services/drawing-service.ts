import type {
  AvailableDrawing,
  CreateDrawingRequest,
  GuessResponse,
  PublicDrawing,
  UserDrawingProgress,
} from "@tipp-my-draw/shared";
import type { Drawing } from "@tipp-my-draw/shared";
import type { DrawingRepo } from "../repos/drawing-repo";
import type { UserRepo } from "../repos/user-repo";
import type { ScoreRepo } from "../repos/score-repo";
import type { ProgressRepo } from "../repos/progress-repo";
import {
  drawerPointsForAttempt,
  MAX_GUESS_ATTEMPTS,
  tipperPointsForHints,
} from "./guess-rules";

type CreatedListener = (drawing: PublicDrawing) => void;

export class DrawingService {
  private readonly createdListeners: CreatedListener[] = [];

  constructor(
    private readonly drawings: DrawingRepo,
    private readonly users: UserRepo,
    private readonly scores: ScoreRepo,
    private readonly progress: ProgressRepo
  ) {}

  onDrawingCreated(listener: CreatedListener): void {
    this.createdListeners.push(listener);
  }

  private async toPublic(drawing: Drawing): Promise<PublicDrawing> {
    const author = await this.users.findById(drawing.userId);
    return {
      id: drawing.id,
      uploaderId: drawing.userId,
      hint1: drawing.hint1,
      hint2: drawing.hint2,
      hint3: drawing.hint3,
      imageDataUrl: drawing.imageDataUrl,
      authorAlias: author?.alias ?? "ismeretlen",
      createdAt: drawing.createdAt ?? 0,
    };
  }

  private withProgress(
    pub: PublicDrawing,
    progress: UserDrawingProgress | null,
    answer?: string
  ): AvailableDrawing {
    return {
      ...pub,
      progress,
      ...(answer != null ? { answer } : {}),
    };
  }

  async listAvailable(userId: string): Promise<AvailableDrawing[]> {
    const all = await this.drawings.findAll();
    const progresses = await this.progress.findAllForUser(userId);
    const closed = new Set(
      progresses
        .filter((p) => p.status === "solved" || p.status === "failed")
        .map((p) => p.drawingId)
    );
    const byDrawing = new Map(progresses.map((p) => [p.drawingId, p]));

    const others = all
      .filter((d) => d.userId !== userId && !closed.has(d.id))
      .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

    const result: AvailableDrawing[] = [];
    for (const d of others) {
      const pub = await this.toPublic(d);
      const prog = byDrawing.get(d.id) ?? null;
      result.push(this.withProgress(pub, prog));
    }
    return result;
  }

  async getProgress(
    userId: string,
    drawingId: string
  ): Promise<AvailableDrawing | null> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId) return null;
    const prog = await this.progress.find(userId, drawingId);
    const pub = await this.toPublic(drawing);
    const answer =
      prog?.status === "solved" ? drawing.name : undefined;
    return this.withProgress(pub, prog, answer);
  }

  async revealHint(
    userId: string,
    drawingId: string,
    hintIndex: 1 | 2 | 3
  ): Promise<UserDrawingProgress> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId) {
      throw new Error("Érvénytelen feladvány.");
    }
    const existing = await this.progress.find(userId, drawingId);
    if (existing?.status === "solved" || existing?.status === "failed") {
      return existing;
    }
    const prog = await this.progress.ensureInProgress(userId, drawingId);
    const hints = [...prog.hintsRevealed] as [boolean, boolean, boolean];
    hints[hintIndex - 1] = true;
    const updated = await this.progress.update(prog.id, {
      hintsRevealed: hints,
    });
    return updated!;
  }

  async create(userId: string, input: CreateDrawingRequest) {
    if (!input.name.trim()) {
      throw new Error("A megfejtés megadása kötelező.");
    }
    if (!input.imageDataUrl.trim()) {
      throw new Error("Üres rajz nem menthető.");
    }
    await this.scores.ensureForUser(userId);
    const created = await this.drawings.insert({
      userId,
      hint1: input.hint1.trim(),
      hint2: input.hint2.trim(),
      hint3: input.hint3.trim(),
      name: input.name.trim(),
      imageDataUrl: input.imageDataUrl,
      createdAt: Date.now(),
    });
    const pub = await this.toPublic(created);
    for (const listener of this.createdListeners) {
      listener(pub);
    }
    return created;
  }

  async guess(
    drawingId: string,
    guesserId: string,
    guess: string
  ): Promise<GuessResponse> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === guesserId) {
      throw new Error("Érvénytelen feladvány.");
    }

    let prog = await this.progress.find(guesserId, drawingId);
    if (prog?.status === "solved") {
      return {
        correct: true,
        message: `Már megfejtetted: ${drawing.name}`,
        attemptsLeft: 0,
        pointsAwarded: null,
        progress: prog,
        answer: drawing.name,
      };
    }
    if (prog?.status === "failed") {
      return {
        correct: false,
        message: "Elfogyott a 3 tipp.",
        attemptsLeft: 0,
        pointsAwarded: null,
        progress: prog,
      };
    }

    prog = await this.progress.ensureInProgress(guesserId, drawingId);
    if (prog.attemptsUsed >= MAX_GUESS_ATTEMPTS) {
      const failed = await this.progress.update(prog.id, { status: "failed" });
      return {
        correct: false,
        message: "Elfogyott a 3 tipp.",
        attemptsLeft: 0,
        pointsAwarded: null,
        progress: failed!,
      };
    }

    const attemptNumber = prog.attemptsUsed + 1;
    const attemptsLeft = MAX_GUESS_ATTEMPTS - attemptNumber;
    const hintsUsed = prog.hintsRevealed.filter(Boolean).length;

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = drawing.name.trim().toLowerCase();

    if (normalizedGuess !== normalizedAnswer) {
      const status = attemptsLeft <= 0 ? "failed" : "in_progress";
      const updated = await this.progress.update(prog.id, {
        attemptsUsed: attemptNumber,
        status,
      });
      return {
        correct: false,
        message:
          attemptsLeft > 0
            ? `${attemptsLeft} tipp lehetőség`
            : "Elfogyott a 3 tipp.",
        attemptsLeft,
        pointsAwarded: null,
        progress: updated!,
      };
    }

    const tipperPts = tipperPointsForHints(hintsUsed);
    const drawerPts = drawerPointsForAttempt(attemptNumber);

    await this.scores.addGuessPoints(guesserId, tipperPts);
    await this.scores.addDrawPoints(drawing.userId, drawerPts);

    const updated = await this.progress.update(prog.id, {
      attemptsUsed: attemptNumber,
      status: "solved",
    });

    return {
      correct: true,
      message: `Talált! ${tipperPts} -pont!`,
      attemptsLeft: 0,
      pointsAwarded: tipperPts,
      progress: updated!,
      answer: drawing.name,
    };
  }
}
