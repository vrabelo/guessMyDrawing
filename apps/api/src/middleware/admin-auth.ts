import type { Request, Response, NextFunction } from "express";
import type { AdminAuthService } from "../services/admin-auth-service";

export function createAdminAuthMiddleware(adminAuth: AdminAuthService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;
    if (!adminAuth.resolve(token)) {
      res.status(401).json({ message: "Admin bejelentkezés szükséges." });
      return;
    }
    next();
  };
}
