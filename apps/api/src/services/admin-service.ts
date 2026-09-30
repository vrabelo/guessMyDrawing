import fs from "fs";
import path from "path";
import type {
  AdminDrawingRow,
  AdminStatsResponse,
  AdminStatMetric,
  AdminUserRow,
} from "@tipp-my-draw/shared";
import type { DbClient } from "../db";
import type { UserRepo } from "../repos/user-repo";
import type { DrawingRepo } from "../repos/drawing-repo";
import type { ScoreRepo } from "../repos/score-repo";
import type { ProgressRepo } from "../repos/progress-repo";

type SnapshotTotals = {
  users: number;
  drawings: number;
  guessPoints: number;
  drawPoints: number;
  lastLoginAt: string;
};

const STATE_PATH = path.join(__dirname, "..", "..", "data", "admin-state.json");

function metric(total: number, previous: number | undefined): AdminStatMetric {
  const delta = previous == null ? 0 : total - previous;
  return { total, delta };
}

export class AdminService {
  constructor(
    private readonly db: DbClient,
    private readonly users: UserRepo,
    private readonly drawings: DrawingRepo,
    private readonly scores: ScoreRepo,
    private readonly progress: ProgressRepo
  ) {}

  private readSnapshot(): SnapshotTotals | null {
    try {
      if (!fs.existsSync(STATE_PATH)) return null;
      const raw = JSON.parse(fs.readFileSync(STATE_PATH, "utf-8")) as Partial<SnapshotTotals>;
      if (
        typeof raw.users !== "number" ||
        typeof raw.drawings !== "number" ||
        typeof raw.guessPoints !== "number" ||
        typeof raw.drawPoints !== "number"
      ) {
        return null;
      }
      return {
        users: raw.users,
        drawings: raw.drawings,
        guessPoints: raw.guessPoints,
        drawPoints: raw.drawPoints,
        lastLoginAt:
          typeof raw.lastLoginAt === "string"
            ? raw.lastLoginAt
            : new Date(0).toISOString(),
      };
    } catch {
      return null;
    }
  }

  private writeSnapshot(totals: Omit<SnapshotTotals, "lastLoginAt">): SnapshotTotals {
    const dir = path.dirname(STATE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const next: SnapshotTotals = {
      ...totals,
      lastLoginAt: new Date().toISOString(),
    };
    fs.writeFileSync(STATE_PATH, JSON.stringify(next, null, 2), "utf-8");
    return next;
  }

  private async currentTotals(): Promise<Omit<SnapshotTotals, "lastLoginAt">> {
    const [users, drawings, guessScores, drawScores] = await Promise.all([
      this.users.findAll(),
      this.drawings.findAll(),
      this.scores.allGuessScores(),
      this.scores.allDrawScores(),
    ]);
    return {
      users: users.length,
      drawings: drawings.length,
      guessPoints: guessScores.reduce((s, r) => s + r.points, 0),
      drawPoints: drawScores.reduce((s, r) => s + r.points, 0),
    };
  }

  private buildStats(
    current: Omit<SnapshotTotals, "lastLoginAt">,
    previous: SnapshotTotals | null
  ): AdminStatsResponse {
    return {
      users: metric(current.users, previous?.users),
      drawings: metric(current.drawings, previous?.drawings),
      guessPoints: metric(current.guessPoints, previous?.guessPoints),
      drawPoints: metric(current.drawPoints, previous?.drawPoints),
      lastLoginAt: previous?.lastLoginAt ?? null,
    };
  }

  /** Compare current totals to last login snapshot (does not write). */
  async getStats(): Promise<AdminStatsResponse> {
    const current = await this.currentTotals();
    const previous = this.readSnapshot();
    return this.buildStats(current, previous);
  }

  /**
   * Stats vs previous login, then overwrite snapshot so the next visit
   * measures from this login. Call once after successful password check.
   */
  async loginStats(): Promise<AdminStatsResponse> {
    const previous = this.readSnapshot();
    const current = await this.currentTotals();
    const stats = this.buildStats(current, previous);
    this.writeSnapshot(current);
    return stats;
  }

  async listDrawings(q = ""): Promise<AdminDrawingRow[]> {
    const needle = q.trim().toLowerCase();
    const [drawings, users] = await Promise.all([
      this.drawings.findAll(),
      this.users.findAll(),
    ]);
    const aliasById = new Map(users.map((u) => [u.id, u.alias]));

    const rows: AdminDrawingRow[] = drawings
      .map((d) => ({
        id: d.id,
        name: d.name,
        theme: d.theme,
        authorAlias: aliasById.get(d.userId) ?? "?",
        authorId: d.userId,
        published: d.published,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);

    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.theme.toLowerCase().includes(needle) ||
        r.authorAlias.toLowerCase().includes(needle)
    );
  }

  async listUsers(q = ""): Promise<AdminUserRow[]> {
    const needle = q.trim().toLowerCase();
    const [users, drawings, guessScores, drawScores] = await Promise.all([
      this.users.findAll(),
      this.drawings.findAll(),
      this.scores.allGuessScores(),
      this.scores.allDrawScores(),
    ]);

    const guessByUser = new Map(guessScores.map((s) => [s.userId, s.points]));
    const drawByUser = new Map(drawScores.map((s) => [s.userId, s.points]));
    const countByUser = new Map<string, number>();
    for (const d of drawings) {
      countByUser.set(d.userId, (countByUser.get(d.userId) ?? 0) + 1);
    }

    const rows: AdminUserRow[] = users
      .map((u) => ({
        id: u.id,
        alias: u.alias,
        guessPoints: guessByUser.get(u.id) ?? 0,
        drawPoints: drawByUser.get(u.id) ?? 0,
        drawingsCount: countByUser.get(u.id) ?? 0,
      }))
      .sort((a, b) => a.alias.localeCompare(b.alias, "hu"));

    if (!needle) return rows;
    return rows.filter((r) => r.alias.toLowerCase().includes(needle));
  }

  async deleteDrawing(id: string): Promise<boolean> {
    const existing = await this.drawings.findById(id);
    if (!existing) return false;

    const allProgress = await this.progress.findAll();
    for (const p of allProgress) {
      if (p.drawingId === id) {
        await this.db.delete("user_drawing_progress", { id: p.id });
      }
    }
    await this.db.delete("drawings", { id });
    return true;
  }

  async deleteUser(
    userId: string,
    options: { deleteDrawings?: boolean } = {}
  ): Promise<boolean> {
    const user = await this.users.findById(userId);
    if (!user) return false;

    if (options.deleteDrawings) {
      const mine = await this.drawings.findByUserId(userId);
      for (const d of mine) {
        await this.deleteDrawing(d.id);
      }
    }

    const allProgress = await this.progress.findAll();
    for (const p of allProgress) {
      if (p.userId === userId) {
        await this.db.delete("user_drawing_progress", { id: p.id });
      }
    }

    const guess = await this.scores.findGuessByUserId(userId);
    if (guess) await this.db.delete("guess_scores", { id: guess.id });

    const draw = await this.scores.findDrawByUserId(userId);
    if (draw) await this.db.delete("draw_scores", { id: draw.id });

    await this.db.delete("users", { id: userId });
    return true;
  }
}
