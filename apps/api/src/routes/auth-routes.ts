import { Router } from "express";
import type { AuthService } from "../services/auth-service";

export function createAuthRoutes(auth: AuthService): Router {
  const router = Router();

  router.post("/login", async (req, res) => {
    const alias = String(req.body?.alias ?? "");
    const pass = String(req.body?.pass ?? "");
    const result = await auth.login(alias, pass);
    if (!result) {
      res.status(401).json({ message: "Hibás alias vagy jelszó." });
      return;
    }
    res.json(result);
  });

  router.post("/register", (_req, res) => {
    res.status(501).json({
      message: "Később kerül kidolgozásra.",
    });
  });

  return router;
}
