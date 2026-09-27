import type {
  CreateDrawingRequest,
  GuessResponse,
  PublicDrawing,
} from "@tipp-my-draw/shared";
import type { DrawingRepo } from "../repos/drawing-repo";
import type { UserRepo } from "../repos/user-repo";
import type { ScoreRepo } from "../repos/score-repo";
import {
  drawerPointsForAttempt,
  GuessSessionStore,
  MAX_GUESS_ATTEMPTS,
  tipperPointsForHints,
} from "./guess-rules";

export class DrawingService {
  private readonly sessions = new GuessSessionStore();

  constructor(
    private readonly drawings: DrawingRepo,
    private readonly users: UserRepo,
    private readonly scores: ScoreRepo
  ) {}

  async getRandomPublic(): Promise<PublicDrawing | null> {
    const drawing = await this.drawings.random();
    if (!drawing) return null;
    const author = await this.users.findById(drawing.userId);
    return {
      id: drawing.id,
      uploaderId: drawing.userId,
      hint1: drawing.hint1,
      hint2: drawing.hint2,
      hint3: drawing.hint3,
      imageDataUrl: drawing.imageDataUrl,
      authorAlias: author?.alias ?? "ismeretlen",
    };
  }

  async create(userId: string, input: CreateDrawingRequest) {
    if (!input.name.trim()) {
      throw new Error("A megfejtés megadása kötelező.");
    }
    if (!input.imageDataUrl.trim()) {
      throw new Error("Üres rajz nem menthető.");
    }
    await this.scores.ensureForUser(userId);
    return this.drawings.insert({
      userId,
      hint1: input.hint1.trim(),
      hint2: input.hint2.trim(),
      hint3: input.hint3.trim(),
      name: input.name.trim(),
      imageDataUrl: input.imageDataUrl,
    });
  }

  async guess(
    drawingId: string,
    guesserId: string,
    guess: string,
    hintsUsed: number
  ): Promise<GuessResponse> {
    const drawing = await this.drawings.findById(drawingId);
    if (!drawing) {
      return {
        correct: false,
        message: "A rajz nem található.",
        attemptsLeft: 0,
        pointsAwarded: null,
      };
    }

    const usedBefore = this.sessions.getAttemptsUsed(guesserId, drawingId);
    if (usedBefore >= MAX_GUESS_ATTEMPTS) {
      return {
        correct: false,
        message: "Nincs több tipp lehetőség.",
        attemptsLeft: 0,
        pointsAwarded: null,
      };
    }

    const attemptNumber = this.sessions.consumeAttempt(guesserId, drawingId);
    const attemptsLeft = MAX_GUESS_ATTEMPTS - attemptNumber;

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = drawing.name.trim().toLowerCase();

    if (normalizedGuess !== normalizedAnswer) {
      return {
        correct: false,
        message:
          attemptsLeft > 0
            ? `${attemptsLeft} tipp lehetőség`
            : "Nincs több tipp lehetőség.",
        attemptsLeft,
        pointsAwarded: null,
      };
    }

    const tipperPts = tipperPointsForHints(hintsUsed);
    const drawerPts = drawerPointsForAttempt(attemptNumber);

    await this.scores.addGuessPoints(guesserId, tipperPts);
    await this.scores.addDrawPoints(drawing.userId, drawerPts);
    this.sessions.clear(guesserId, drawingId);

    return {
      correct: true,
      message: `Talált! ${tipperPts} -pont!`,
      attemptsLeft: 0,
      pointsAwarded: tipperPts,
    };
  }
}
