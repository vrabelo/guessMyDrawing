import { Router } from "express";
import type { ScoreService } from "../services/score-service";
import type { AuthedRequest } from "../middleware/auth";

export function createLeaderboardRoutes(
  scores: ScoreService,
  requireAuth: (
    req: AuthedRequest,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => void
): Router {
  const router = Router();

  router.get("/", requireAuth, async (_req, res) => {
    const data = await scores.leaderboards();
    res.json(data);
  });

  router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
    const data = await scores.userStats(req.auth!.userId);
    res.json(data);
  });

  return router;
}
