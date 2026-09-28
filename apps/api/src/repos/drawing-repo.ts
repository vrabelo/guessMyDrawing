import type { Drawing } from "@tipp-my-draw/shared";
import { v4 as uuid } from "uuid";
import type { DbClient } from "../db";

export class DrawingRepo {
  constructor(private readonly db: DbClient) {}

  async findAll(): Promise<Drawing[]> {
    return this.db.findMany<Drawing>("drawings");
  }

  async findById(id: string): Promise<Drawing | null> {
    return this.db.findFirst<Drawing>("drawings", { id });
  }

  async findByUserId(userId: string): Promise<Drawing[]> {
    const all = await this.findAll();
    return all
      .filter((d) => d.userId === userId)
      .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0));
  }

  async insert(input: Omit<Drawing, "id">): Promise<Drawing> {
    return this.db.insert<Drawing>("drawings", {
      id: uuid(),
      ...input,
    });
  }

  async update(
    id: string,
    patch: Partial<Omit<Drawing, "id" | "userId" | "createdAt">>
  ): Promise<Drawing | null> {
    return this.db.update<Drawing>("drawings", { id } as Partial<Drawing>, patch);
  }
}
