import { randomBytes } from "crypto";

export class AdminAuthError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

/**
 * Separate from player AuthService — shared password gate for /admin.
 * Default password: nimda (override with ADMIN_PASSWORD).
 */
export class AdminAuthService {
  private readonly sessions = new Set<string>();
  private readonly password: string;

  constructor(password = process.env.ADMIN_PASSWORD ?? "nimda") {
    this.password = password;
  }

  login(password: string): { token: string } | null {
    if (password !== this.password) return null;
    const token = randomBytes(24).toString("hex");
    this.sessions.add(token);
    return { token };
  }

  resolve(token: string | undefined): boolean {
    if (!token) return false;
    return this.sessions.has(token);
  }
}
