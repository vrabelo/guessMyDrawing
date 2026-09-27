import { v4 as uuid } from "uuid";
import type { DrawScore, GuessScore } from "@tipp-my-draw/shared";
import type { DbClient } from "../db";

export class ScoreRepo {
  constructor(private readonly db: DbClient) {}

  findGuessByUserId(userId: string): Promise<GuessScore | null> {
    return this.db.findFirst<GuessScore>("guess_scores", { userId });
  }

  findDrawByUserId(userId: string): Promise<DrawScore | null> {
    return this.db.findFirst<DrawScore>("draw_scores", { userId });
  }

  async ensureGuessForUser(userId: string): Promise<GuessScore> {
    const existing = await this.findGuessByUserId(userId);
    if (existing) return existing;
    return this.db.insert<GuessScore>("guess_scores", {
      id: uuid(),
      userId,
      points: 0,
    });
  }

  async ensureDrawForUser(userId: string): Promise<DrawScore> {
    const existing = await this.findDrawByUserId(userId);
    if (existing) return existing;
    return this.db.insert<DrawScore>("draw_scores", {
      id: uuid(),
      userId,
      points: 0,
    });
  }

  async ensureForUser(userId: string): Promise<void> {
    await this.ensureGuessForUser(userId);
    await this.ensureDrawForUser(userId);
  }

  async addGuessPoints(userId: string, amount: number): Promise<GuessScore> {
    const score = await this.ensureGuessForUser(userId);
    if (amount <= 0) return score;
    const updated = await this.db.update<GuessScore>(
      "guess_scores",
      { id: score.id },
      { points: score.points + amount }
    );
    return updated!;
  }

  async addDrawPoints(userId: string, amount: number): Promise<DrawScore> {
    const score = await this.ensureDrawForUser(userId);
    if (amount <= 0) return score;
    const updated = await this.db.update<DrawScore>(
      "draw_scores",
      { id: score.id },
      { points: score.points + amount }
    );
    return updated!;
  }

  orderedByGuess(limit = 10): Promise<GuessScore[]> {
    return this.db.findMany<GuessScore>("guess_scores", {
      orderBy: { field: "points", dir: "desc" },
      limit,
    });
  }

  orderedByDraw(limit = 10): Promise<DrawScore[]> {
    return this.db.findMany<DrawScore>("draw_scores", {
      orderBy: { field: "points", dir: "desc" },
      limit,
    });
  }

  async allGuessScores(): Promise<GuessScore[]> {
    return this.db.findMany<GuessScore>("guess_scores");
  }

  async allDrawScores(): Promise<DrawScore[]> {
    return this.db.findMany<DrawScore>("draw_scores");
  }
}
