import type { User } from "@tipp-my-draw/shared";
import type { DbClient } from "../db";

export class UserRepo {
  constructor(private readonly db: DbClient) {}

  findByAlias(alias: string): Promise<User | null> {
    return this.db.findFirst<User>("users", { alias });
  }

  findById(id: string): Promise<User | null> {
    return this.db.findFirst<User>("users", { id });
  }

  findAll(): Promise<User[]> {
    return this.db.findMany<User>("users");
  }
}
