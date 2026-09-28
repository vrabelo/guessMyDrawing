import { v4 as uuid } from "uuid";
import type { User } from "@tipp-my-draw/shared";
import type { DbClient } from "../db";

export class UserRepo {
  constructor(private readonly db: DbClient) {}

  async findByAlias(alias: string): Promise<User | null> {
    const needle = alias.toLowerCase();
    const users = await this.db.findMany<User>("users");
    return users.find((u) => u.alias.toLowerCase() === needle) ?? null;
  }

  findById(id: string): Promise<User | null> {
    return this.db.findFirst<User>("users", { id });
  }

  findAll(): Promise<User[]> {
    return this.db.findMany<User>("users");
  }

  async create(input: { alias: string; pass: string }): Promise<User> {
    const user: User = {
      id: uuid(),
      alias: input.alias,
      pass: input.pass,
    };
    return this.db.insert<User>("users", user);
  }
}
