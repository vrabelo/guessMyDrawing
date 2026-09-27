import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "../services/auth-service";

export type AuthedRequest = Request & {
  auth?: { userId: string; alias: string };
};

export function createAuthMiddleware(auth: AuthService) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;
    const session = auth.resolve(token);
    if (!session) {
      res.status(401).json({ message: "Bejelentkezés szükséges." });
      return;
    }
    req.auth = { userId: session.userId, alias: session.alias };
    next();
  };
}
