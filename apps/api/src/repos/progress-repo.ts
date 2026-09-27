import { v4 as uuid } from "uuid";
import type { UserDrawingProgress } from "@tipp-my-draw/shared";
import type { DbClient } from "../db";

export class ProgressRepo {
  constructor(private readonly db: DbClient) {}

  find(
    userId: string,
    drawingId: string
  ): Promise<UserDrawingProgress | null> {
    return this.db.findFirst<UserDrawingProgress>("user_drawing_progress", {
      userId,
      drawingId,
    });
  }

  findAllForUser(userId: string): Promise<UserDrawingProgress[]> {
    return this.db.findMany<UserDrawingProgress>("user_drawing_progress", {
      where: { userId },
    });
  }

  async ensureInProgress(
    userId: string,
    drawingId: string
  ): Promise<UserDrawingProgress> {
    const existing = await this.find(userId, drawingId);
    if (existing) return existing;
    return this.db.insert<UserDrawingProgress>("user_drawing_progress", {
      id: uuid(),
      userId,
      drawingId,
      status: "in_progress",
      attemptsUsed: 0,
      hintsRevealed: [false, false, false],
      updatedAt: Date.now(),
    });
  }

  async update(
    id: string,
    patch: Partial<UserDrawingProgress>
  ): Promise<UserDrawingProgress | null> {
    return this.db.update<UserDrawingProgress>(
      "user_drawing_progress",
      { id },
      { ...patch, updatedAt: Date.now() }
    );
  }
}
