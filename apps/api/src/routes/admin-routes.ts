import { Router } from "express";
import type { AdminAuthService } from "../services/admin-auth-service";
import type { AdminService } from "../services/admin-service";
import { createAdminAuthMiddleware } from "../middleware/admin-auth";

export function createAdminRoutes(
  adminAuth: AdminAuthService,
  admin: AdminService
): Router {
  const router = Router();
  const requireAdmin = createAdminAuthMiddleware(adminAuth);

  router.post("/login", async (req, res) => {
    const password = String(req.body?.password ?? "");
    const session = adminAuth.login(password);
    if (!session) {
      res.status(401).json({ message: "Hibás jelszó." });
      return;
    }
    const stats = await admin.loginStats();
    res.json({ token: session.token, stats });
  });

  router.get("/stats", requireAdmin, async (_req, res) => {
    const stats = await admin.getStats();
    res.json(stats);
  });

  router.get("/drawings", requireAdmin, async (req, res) => {
    const q = String(req.query.q ?? "");
    const rows = await admin.listDrawings(q);
    res.json(rows);
  });

  router.delete("/drawings/:id", requireAdmin, async (req, res) => {
    const ok = await admin.deleteDrawing(String(req.params.id));
    if (!ok) {
      res.status(404).json({ message: "Rajz nem található." });
      return;
    }
    res.json({ ok: true });
  });

  router.get("/users", requireAdmin, async (req, res) => {
    const q = String(req.query.q ?? "");
    const rows = await admin.listUsers(q);
    res.json(rows);
  });

  router.delete("/users/:id", requireAdmin, async (req, res) => {
    const deleteDrawings = Boolean(req.body?.deleteDrawings);
    const ok = await admin.deleteUser(String(req.params.id), { deleteDrawings });
    if (!ok) {
      res.status(404).json({ message: "Felhasználó nem található." });
      return;
    }
    res.json({ ok: true });
  });

  return router;
}
