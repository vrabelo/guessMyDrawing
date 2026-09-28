import { Router } from "express";
import { AuthError, type AuthService } from "../services/auth-service";

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

  router.post("/register", async (req, res) => {
    const alias = String(req.body?.alias ?? "");
    const pass = String(req.body?.pass ?? "");
    try {
      const result = await auth.register(alias, pass);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof AuthError) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      throw err;
    }
  });

  return router;
}
