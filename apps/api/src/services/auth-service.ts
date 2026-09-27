import { randomBytes } from "crypto";
import type { LoginResponse, PublicUser } from "@tipp-my-draw/shared";
import type { UserRepo } from "../repos/user-repo";

type Session = {
  token: string;
  userId: string;
  alias: string;
};

export class AuthService {
  private readonly sessions = new Map<string, Session>();

  constructor(private readonly users: UserRepo) {}

  async login(alias: string, pass: string): Promise<LoginResponse | null> {
    const user = await this.users.findByAlias(alias);
    if (!user || user.pass !== pass) return null;

    const token = randomBytes(24).toString("hex");
    this.sessions.set(token, {
      token,
      userId: user.id,
      alias: user.alias,
    });

    const publicUser: PublicUser = { id: user.id, alias: user.alias };
    return { token, user: publicUser };
  }

  resolve(token: string | undefined): Session | null {
    if (!token) return null;
    return this.sessions.get(token) ?? null;
  }
}
