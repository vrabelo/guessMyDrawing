import { randomBytes } from "crypto";
import type { LoginResponse, PublicUser } from "@tipp-my-draw/shared";
import type { UserRepo } from "../repos/user-repo";

type Session = {
  token: string;
  userId: string;
  alias: string;
};

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthService {
  private readonly sessions = new Map<string, Session>();

  constructor(private readonly users: UserRepo) {}

  async login(alias: string, pass: string): Promise<LoginResponse | null> {
    const user = await this.users.findByAlias(alias.trim());
    if (!user || user.pass !== pass) return null;

    return this.createSession(user.id, user.alias);
  }

  async register(alias: string, pass: string): Promise<LoginResponse> {
    const trimmedAlias = alias.trim();
    const trimmedPass = pass.trim();
    if (!trimmedAlias || !trimmedPass) {
      throw new AuthError(400, "Add meg a felhasználónevet és a jelszót.");
    }

    const existing = await this.users.findByAlias(trimmedAlias);
    if (existing) {
      throw new AuthError(409, "Ez a felhasználónév már foglalt.");
    }

    const user = await this.users.create({
      alias: trimmedAlias,
      pass: trimmedPass,
    });
    return this.createSession(user.id, user.alias);
  }

  resolve(token: string | undefined): Session | null {
    if (!token) return null;
    return this.sessions.get(token) ?? null;
  }

  private createSession(userId: string, alias: string): LoginResponse {
    const token = randomBytes(24).toString("hex");
    this.sessions.set(token, {
      token,
      userId,
      alias,
    });

    const publicUser: PublicUser = { id: userId, alias };
    return { token, user: publicUser };
  }
}
