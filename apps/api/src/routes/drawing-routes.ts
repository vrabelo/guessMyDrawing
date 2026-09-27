import { Router } from "express";
import type { DrawingService } from "../services/drawing-service";
import type { AuthedRequest } from "../middleware/auth";

export function createDrawingRoutes(
  drawings: DrawingService,
  requireAuth: (req: AuthedRequest, res: import("express").Response, next: import("express").NextFunction) => void
): Router {
  const router = Router();

  router.get("/random", requireAuth, async (_req, res) => {
    const drawing = await drawings.getRandomPublic();
    if (!drawing) {
      res.status(404).json({ message: "Még nincs rajz a rendszerben." });
      return;
    }
    res.json(drawing);
  });

  router.post("/", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const created = await drawings.create(req.auth!.userId, {
        hint1: String(req.body?.hint1 ?? ""),
        hint2: String(req.body?.hint2 ?? ""),
        hint3: String(req.body?.hint3 ?? ""),
        name: String(req.body?.name ?? ""),
        imageDataUrl: String(req.body?.imageDataUrl ?? ""),
      });
      res.status(201).json(created);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mentés sikertelen.";
      res.status(400).json({ message });
    }
  });

  router.post("/:id/guess", requireAuth, async (req: AuthedRequest, res) => {
    const hintsUsed = Number(req.body?.hintsUsed ?? 0);
    const result = await drawings.guess(
      req.params.id,
      req.auth!.userId,
      String(req.body?.guess ?? ""),
      Number.isFinite(hintsUsed) ? hintsUsed : 0
    );
    res.json(result);
  });

  return router;
}
