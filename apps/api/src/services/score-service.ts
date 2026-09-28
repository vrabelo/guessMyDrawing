import type {
  LeaderboardEntry,
  LeaderboardsResponse,
  UserStatsResponse,
} from "@tipp-my-draw/shared";
import type { ScoreRepo } from "../repos/score-repo";
import type { UserRepo } from "../repos/user-repo";
import type { DrawingRepo } from "../repos/drawing-repo";
import type { ProgressRepo } from "../repos/progress-repo";

const TOP_N = 10;

function rankOf(
  userId: string,
  ordered: { userId: string; points: number }[]
): number | null {
  const idx = ordered.findIndex((e) => e.userId === userId);
  return idx >= 0 ? idx + 1 : null;
}

export class ScoreService {
  constructor(
    private readonly scores: ScoreRepo,
    private readonly users: UserRepo,
    private readonly drawings: DrawingRepo,
    private readonly progress: ProgressRepo
  ) {}

  async leaderboards(): Promise<LeaderboardsResponse> {
    const users = await this.users.findAll();
    const aliasById = new Map(users.map((u) => [u.id, u.alias]));

    const byGuess = await this.scores.orderedByGuess(TOP_N);
    const byDraw = await this.scores.orderedByDraw(TOP_N);

    const tippers = byGuess.map((s) => ({
      userId: s.userId,
      alias: aliasById.get(s.userId) ?? "?",
      points: s.points,
    }));

    const creators = byDraw.map((s) => ({
      userId: s.userId,
      alias: aliasById.get(s.userId) ?? "?",
      points: s.points,
    }));

    const overall = (await this.buildOverallTotals(aliasById)).slice(0, TOP_N);

    return { tippers, creators, overall };
  }

  async userStats(userId: string): Promise<UserStatsResponse> {
    await this.scores.ensureForUser(userId);

    const guess = await this.scores.findGuessByUserId(userId);
    const draw = await this.scores.findDrawByUserId(userId);
    const guessPoints = guess?.points ?? 0;
    const drawPoints = draw?.points ?? 0;

    const allDrawings = await this.drawings.findAll();
    const drawingsCount = allDrawings.filter((d) => d.userId === userId).length;

    const progressRows = await this.progress.findAllForUser(userId);
    const totalGuesses = progressRows.reduce(
      (sum, p) => sum + (p.attemptsUsed ?? 0),
      0
    );

    const users = await this.users.findAll();
    const aliasById = new Map(users.map((u) => [u.id, u.alias]));

    const tipperOrdered = (await this.scores.allGuessScores())
      .map((s) => ({ userId: s.userId, points: s.points }))
      .sort((a, b) => b.points - a.points);

    const creatorOrdered = (await this.scores.allDrawScores())
      .map((s) => ({ userId: s.userId, points: s.points }))
      .sort((a, b) => b.points - a.points);

    const overallOrdered = await this.buildOverallTotals(aliasById);

    return {
      totalGuesses,
      totalPoints: guessPoints + drawPoints,
      drawingsCount,
      guessPoints,
      drawPoints,
      ranks: {
        tipper: rankOf(userId, tipperOrdered),
        creator: rankOf(userId, creatorOrdered),
        overall: rankOf(userId, overallOrdered),
      },
    };
  }

  private async buildOverallTotals(
    aliasById: Map<string, string>
  ): Promise<LeaderboardEntry[]> {
    const guessAll = await this.scores.allGuessScores();
    const drawAll = await this.scores.allDrawScores();
    const totals = new Map<string, number>();

    for (const g of guessAll) {
      totals.set(g.userId, (totals.get(g.userId) ?? 0) + g.points);
    }
    for (const d of drawAll) {
      totals.set(d.userId, (totals.get(d.userId) ?? 0) + d.points);
    }

    return [...totals.entries()]
      .map(([userId, points]) => ({
        userId,
        alias: aliasById.get(userId) ?? "?",
        points,
      }))
      .sort((a, b) => b.points - a.points);
  }
}
