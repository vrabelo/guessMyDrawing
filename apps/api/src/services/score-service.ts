import type {
  LeaderboardEntry,
  LeaderboardsResponse,
} from "@tipp-my-draw/shared";
import type { ScoreRepo } from "../repos/score-repo";
import type { UserRepo } from "../repos/user-repo";

const TOP_N = 10;

export class ScoreService {
  constructor(
    private readonly scores: ScoreRepo,
    private readonly users: UserRepo
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

    const overall = await this.buildOverall(aliasById);

    return { tippers, creators, overall };
  }

  private async buildOverall(
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
      .sort((a, b) => b.points - a.points)
      .slice(0, TOP_N);
  }
}
