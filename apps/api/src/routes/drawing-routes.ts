import { Router } from "express";
import type { DrawingService } from "../services/drawing-service";
import type { AuthedRequest } from "../middleware/auth";

export function createDrawingRoutes(
  drawings: DrawingService,
  requireAuth: (
    req: AuthedRequest,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => void
): Router {
  const router = Router();

  router.get("/available", requireAuth, async (req: AuthedRequest, res) => {
    const list = await drawings.listAvailable(req.auth!.userId);
    res.json(list);
  });

  router.get("/mine", requireAuth, async (req: AuthedRequest, res) => {
    const list = await drawings.listMine(req.auth!.userId);
    res.json(list);
  });

  router.post("/:id/start", requireAuth, async (req: AuthedRequest, res) => {
    const item = await drawings.startViewing(req.auth!.userId, req.params.id);
    if (!item) {
      res.status(404).json({ message: "Feladvány nem található." });
      return;
    }
    res.json(item);
  });

  router.get(
    "/:id/post-bonus-answer",
    requireAuth,
    async (req: AuthedRequest, res) => {
      const item = await drawings.postBonusAnswer(
        req.auth!.userId,
        req.params.id
      );
      if (!item) {
        res.status(403).json({
          message: "A megfejtés nem érhető el.",
        });
        return;
      }
      res.json(item);
    }
  );

  router.post("/:id/expire", requireAuth, async (req: AuthedRequest, res) => {
    const progress = await drawings.expireRound(
      req.auth!.userId,
      req.params.id
    );
    if (!progress) {
      res.status(404).json({ message: "Feladvány nem található." });
      return;
    }
    res.json(progress);
  });

  router.get("/:id/progress", requireAuth, async (req: AuthedRequest, res) => {
    const item = await drawings.getProgress(req.auth!.userId, req.params.id);
    if (!item) {
      res.status(404).json({ message: "Feladvány nem található." });
      return;
    }
    res.json(item);
  });

  router.patch("/:id/progress", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const hint = Number(req.body?.revealHint);
      if (hint !== 1) {
        res.status(400).json({ message: "revealHint: csak 1." });
        return;
      }
      const progress = await drawings.revealHint(
        req.auth!.userId,
        req.params.id,
        1
      );
      res.json(progress);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Progress mentés sikertelen.";
      res.status(400).json({ message });
    }
  });

  router.post("/", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const created = await drawings.create(req.auth!.userId, {
        theme: String(req.body?.theme ?? ""),
        hint1: String(req.body?.hint1 ?? ""),
        hint2: String(req.body?.hint2 ?? ""),
        hint3: String(req.body?.hint3 ?? ""),
        name: String(req.body?.name ?? ""),
        imageDataUrl: String(req.body?.imageDataUrl ?? ""),
        published: Boolean(req.body?.published),
      });
      res.status(201).json(created);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mentés sikertelen.";
      res.status(400).json({ message });
    }
  });

  router.patch("/:id", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const updated = await drawings.update(req.auth!.userId, req.params.id, {
        theme: String(req.body?.theme ?? ""),
        hint1: String(req.body?.hint1 ?? ""),
        hint2: String(req.body?.hint2 ?? ""),
        hint3: String(req.body?.hint3 ?? ""),
        name: String(req.body?.name ?? ""),
        imageDataUrl: String(req.body?.imageDataUrl ?? ""),
        published: Boolean(req.body?.published),
      });
      res.json(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mentés sikertelen.";
      const status = message.includes("nem szerkeszthető") ? 403 : 400;
      res.status(status).json({ message });
    }
  });

  router.post("/:id/guess", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const result = await drawings.guess(
        req.params.id,
        req.auth!.userId,
        String(req.body?.guess ?? "")
      );
      res.json(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tippelés sikertelen.";
      res.status(400).json({ message });
    }
  });

  return router;
}
