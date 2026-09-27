import express from "express";
import cors from "cors";
import { createDb } from "./db";
import { UserRepo } from "./repos/user-repo";
import { DrawingRepo } from "./repos/drawing-repo";
import { ScoreRepo } from "./repos/score-repo";
import { AuthService } from "./services/auth-service";
import { DrawingService } from "./services/drawing-service";
import { ScoreService } from "./services/score-service";
import { createAuthMiddleware } from "./middleware/auth";
import { createAuthRoutes } from "./routes/auth-routes";
import { createDrawingRoutes } from "./routes/drawing-routes";
import { createLeaderboardRoutes } from "./routes/leaderboard-routes";

export function createApp() {
  const db = createDb();
  const users = new UserRepo(db);
  const drawings = new DrawingRepo(db);
  const scores = new ScoreRepo(db);

  const authService = new AuthService(users);
  const drawingService = new DrawingService(drawings, users, scores);
  const scoreService = new ScoreService(scores, users);
  const requireAuth = createAuthMiddleware(authService);

  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "5mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", createAuthRoutes(authService));
  app.use("/api/drawings", createDrawingRoutes(drawingService, requireAuth));
  app.use(
    "/api/leaderboards",
    createLeaderboardRoutes(scoreService, requireAuth)
  );

  return app;
}
