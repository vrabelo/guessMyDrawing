import type {
  AvailableDrawing,
  CreateDrawingRequest,
  GuessResponse,
  OwnedDrawing,
  PublicDrawing,
  UpdateDrawingRequest,
  UserDrawingProgress,
} from "@tipp-my-draw/shared";
import type { DrawingRepo } from "../repos/drawing-repo";
import type { UserRepo } from "../repos/user-repo";
import type { ScoreRepo } from "../repos/score-repo";
import type { ProgressRepo } from "../repos/progress-repo";
import {
  awardTipperPoints,
  drawerPointsForAttempt,
  MAX_GUESS_ATTEMPTS,
} from "./guess-rules";
import {
  isPublished,
  normalizeProgress,
  toOwnedDrawing,
  toPublicDrawing,
  withProgress,
} from "./drawing-mappers";

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

  private toPublic(drawing: Parameters<typeof toPublicDrawing>[0]) {
    return toPublicDrawing(drawing, this.users);
  }

  private toOwned(drawing: Parameters<typeof toOwnedDrawing>[0]) {
    return toOwnedDrawing(drawing);
  }

  private withProgress = withProgress;
  private normalizeProgress = normalizeProgress;

  private async reopenFailedForRetry(
    prog: UserDrawingProgress
  ): Promise<UserDrawingProgress> {
    if (prog.status !== "failed") return prog;
    const updated = await this.progress.update(prog.id, {
      status: "in_progress",
      attemptsUsed: 0,
      hintsRevealed: [false],
      priorFailure: true,
      guessStartedAt: Date.now(),
    });
    return updated!;
  }

  /** Start / resume the guess timer when tipper clicks Mehet. */
  async startViewing(
    userId: string,
    drawingId: string
  ): Promise<AvailableDrawing | null> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId || !isPublished(drawing)) {
      return null;
    }
    let prog = await this.progress.find(userId, drawingId);
    if (prog?.status === "solved" || prog?.status === "expired") {
      const pub = await this.toPublic(drawing);
      return this.withProgress(
        pub,
        this.normalizeProgress(prog),
        drawing.name
      );
    }
    if (prog?.status === "failed") {
      prog = await this.reopenFailedForRetry(prog);
    } else {
      prog = await this.progress.ensureInProgress(userId, drawingId);
    }
    // Always (re)start the clock when the tipper explicitly begins the round.
    prog = (await this.progress.update(prog.id, {
      guessStartedAt: Date.now(),
      status: "in_progress",
    }))!;
    const pub = await this.toPublic(drawing);
    return this.withProgress(pub, this.normalizeProgress(prog));
  }

  /**
   * Return the answer for progressive letter blanks / reveals once the
   * tipper has started viewing (blanks need length + letters from t=0).
   */
  async postBonusAnswer(
    userId: string,
    drawingId: string
  ): Promise<{ answer: string } | null> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId || !isPublished(drawing)) {
      return null;
    }
    let prog = await this.progress.find(userId, drawingId);
    if (!prog) {
      return null;
    }
    if (prog.status === "expired" || prog.status === "solved") {
      return { answer: drawing.name };
    }
    if (!prog.guessStartedAt) {
      return null;
    }
    return { answer: drawing.name };
  }

  /** Full letter reveal timed out — puzzle leaves the tipper's pool. */
  async expireRound(
    userId: string,
    drawingId: string
  ): Promise<UserDrawingProgress | null> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId || !isPublished(drawing)) {
      return null;
    }
    let prog = await this.progress.find(userId, drawingId);
    if (!prog) {
      prog = await this.progress.ensureInProgress(userId, drawingId);
    }
    if (prog.status === "solved" || prog.status === "expired") {
      return this.normalizeProgress(prog);
    }
    const updated = await this.progress.update(prog.id, {
      status: "expired",
    });
    return this.normalizeProgress(updated!);
  }

  private assertPublishableMeta(input: {
    theme: string;
    name: string;
  }) {
    if (!input.name.trim()) {
      throw new Error("A megfejtés megadása kötelező.");
    }
  }

  async listMine(userId: string): Promise<OwnedDrawing[]> {
    const list = await this.drawings.findByUserId(userId);
    return list.map((d) => this.toOwned(d));
  }

  async listAvailable(userId: string): Promise<AvailableDrawing[]> {
    const all = await this.drawings.findAll();
    const progresses = await this.progress.findAllForUser(userId);
    const solvedOrExpired = new Set(
      progresses
        .filter((p) => p.status === "solved" || p.status === "expired")
        .map((p) => p.drawingId)
    );
    const byDrawing = new Map(progresses.map((p) => [p.drawingId, p]));

    const others = all
      .filter(
        (d) =>
          isPublished(d) && d.userId !== userId && !solvedOrExpired.has(d.id)
      )
      .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

    const result: AvailableDrawing[] = [];
    for (const d of others) {
      const pub = await this.toPublic(d);
      let prog = byDrawing.get(d.id) ?? null;
      if (prog?.status === "failed") {
        prog = await this.reopenFailedForRetry(prog);
      }
      result.push(
        this.withProgress(pub, prog ? this.normalizeProgress(prog) : null)
      );
    }
    return result;
  }

  async getProgress(
    userId: string,
    drawingId: string
  ): Promise<AvailableDrawing | null> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId || !isPublished(drawing)) {
      return null;
    }
    let prog = await this.progress.find(userId, drawingId);
    if (prog?.status === "failed") {
      prog = await this.reopenFailedForRetry(prog);
    }
    const pub = await this.toPublic(drawing);
    const answer = prog?.status === "solved" ? drawing.name : undefined;
    return this.withProgress(
      pub,
      prog ? this.normalizeProgress(prog) : null,
      answer
    );
  }

  async revealHint(
    userId: string,
    drawingId: string,
    hintIndex: 1
  ): Promise<UserDrawingProgress> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === userId || !isPublished(drawing)) {
      throw new Error("Érvénytelen feladvány.");
    }
    let existing = await this.progress.find(userId, drawingId);
    if (existing?.status === "solved") {
      return this.normalizeProgress(existing);
    }
    if (existing?.status === "failed") {
      existing = await this.reopenFailedForRetry(existing);
    }
    const prog =
      existing ?? (await this.progress.ensureInProgress(userId, drawingId));
    if (hintIndex !== 1) {
      throw new Error("Csak 1 hint érhető el.");
    }
    const updated = await this.progress.update(prog.id, {
      hintsRevealed: [true],
    });
    return this.normalizeProgress(updated!);
  }

  async create(
    userId: string,
    input: CreateDrawingRequest
  ): Promise<OwnedDrawing> {
    if (!input.name.trim()) {
      throw new Error("A megfejtés megadása kötelező.");
    }
    if (!input.imageDataUrl.trim()) {
      throw new Error("Üres rajz nem menthető.");
    }
    const published = Boolean(input.published);
    if (published) {
      this.assertPublishableMeta(input);
    }
    await this.scores.ensureForUser(userId);
    const now = Date.now();
    const created = await this.drawings.insert({
      userId,
      theme: (input.theme ?? "").trim(),
      hint1: input.hint1.trim(),
      hint2: input.hint2.trim(),
      hint3: input.hint3.trim(),
      name: input.name.trim(),
      imageDataUrl: input.imageDataUrl,
      published,
      createdAt: now,
      updatedAt: now,
    });
    if (published) {
      const pub = await this.toPublic(created);
      for (const listener of this.createdListeners) {
        listener(pub);
      }
    }
    return this.toOwned(created);
  }

  async update(
    userId: string,
    drawingId: string,
    input: UpdateDrawingRequest
  ): Promise<OwnedDrawing> {
    const existing = await this.drawings.findById(drawingId);
    if (!existing || existing.userId !== userId) {
      throw new Error("Rajz nem található.");
    }
    if (isPublished(existing)) {
      throw new Error("Publikált rajz nem szerkeszthető.");
    }
    if (!input.name.trim()) {
      throw new Error("A megfejtés megadása kötelező.");
    }
    if (!input.imageDataUrl.trim()) {
      throw new Error("Üres rajz nem menthető.");
    }
    const published = Boolean(input.published);
    if (published) {
      this.assertPublishableMeta(input);
    }
    const updated = await this.drawings.update(drawingId, {
      theme: (input.theme ?? "").trim(),
      hint1: input.hint1.trim(),
      hint2: input.hint2.trim(),
      hint3: input.hint3.trim(),
      name: input.name.trim(),
      imageDataUrl: input.imageDataUrl,
      published,
      updatedAt: Date.now(),
    });
    if (!updated) {
      throw new Error("Mentés sikertelen.");
    }
    if (published) {
      const pub = await this.toPublic(updated);
      for (const listener of this.createdListeners) {
        listener(pub);
      }
    }
    return this.toOwned(updated);
  }

  async guess(
    drawingId: string,
    guesserId: string,
    guess: string
  ): Promise<GuessResponse> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing || drawing.userId === guesserId || !isPublished(drawing)) {
      throw new Error("Érvénytelen feladvány.");
    }

    let prog = await this.progress.find(guesserId, drawingId);
    if (prog?.status === "solved") {
      return {
        correct: true,
        message: `Már megfejtetted: ${drawing.name}`,
        attemptsLeft: 0,
        pointsAwarded: null,
        roundComplete: true,
        halfPointsApplied: Boolean(prog.priorFailure),
        progress: this.normalizeProgress(prog),
        answer: drawing.name,
      };
    }
    if (prog?.status === "failed") {
      prog = await this.reopenFailedForRetry(prog);
    }

    prog = prog ?? (await this.progress.ensureInProgress(guesserId, drawingId));
    prog = this.normalizeProgress(prog);

    const startedAt = prog.guessStartedAt ?? Date.now();
    if (prog.guessStartedAt == null) {
      const patched = await this.progress.update(prog.id, {
        guessStartedAt: startedAt,
      });
      prog = this.normalizeProgress(patched!);
    }
    const elapsedMs = Math.max(0, Date.now() - startedAt);

    if (prog.attemptsUsed >= MAX_GUESS_ATTEMPTS) {
      const failed = await this.progress.update(prog.id, {
        status: "failed",
        priorFailure: true,
      });
      return {
        correct: false,
        message: "Elfogyott a 3 tipp.",
        attemptsLeft: 0,
        pointsAwarded: null,
        roundComplete: true,
        halfPointsApplied: false,
        progress: this.normalizeProgress(failed!),
      };
    }

    const attemptNumber = prog.attemptsUsed + 1;
    const attemptsLeft = MAX_GUESS_ATTEMPTS - attemptNumber;
    const hintsUsed = prog.hintsRevealed.filter(Boolean).length;
    const priorFailure = Boolean(prog.priorFailure);

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = drawing.name.trim().toLowerCase();

    if (normalizedGuess !== normalizedAnswer) {
      const status = attemptsLeft <= 0 ? "failed" : "in_progress";
      const updated = await this.progress.update(prog.id, {
        attemptsUsed: attemptNumber,
        status,
        ...(status === "failed" ? { priorFailure: true } : {}),
      });
      return {
        correct: false,
        message:
          attemptsLeft > 0
            ? `${attemptsLeft} tipp lehetőség`
            : "Elfogyott a 3 tipp.",
        attemptsLeft,
        pointsAwarded: null,
        roundComplete: attemptsLeft <= 0,
        halfPointsApplied: false,
        progress: this.normalizeProgress(updated!),
      };
    }

    const tipperPts = awardTipperPoints(hintsUsed, priorFailure, elapsedMs);
    const drawerPts = drawerPointsForAttempt(attemptNumber);

    await this.scores.addGuessPoints(guesserId, tipperPts);
    await this.scores.addDrawPoints(drawing.userId, drawerPts);

    const updated = await this.progress.update(prog.id, {
      attemptsUsed: attemptNumber,
      status: "solved",
    });

    const ptsLabel = Number.isInteger(tipperPts)
      ? String(tipperPts)
      : tipperPts.toFixed(1).replace(".", ",");
    const speedNote = ` (${(elapsedMs / 1000).toFixed(1).replace(".", ",")} mp)`;

    return {
      correct: true,
      message: priorFailure
        ? `Talált! ${ptsLabel} pont (fél pont a korábbi hibáért)${speedNote}.`
        : `Talált! ${ptsLabel} pont${speedNote}!`,
      attemptsLeft: 0,
      pointsAwarded: tipperPts,
      roundComplete: true,
      halfPointsApplied: priorFailure,
      progress: this.normalizeProgress(updated!),
      answer: drawing.name,
    };
  }
}
