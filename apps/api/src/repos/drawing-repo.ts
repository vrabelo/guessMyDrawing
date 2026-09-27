import { v4 as uuid } from "uuid";
import type { Drawing } from "@tipp-my-draw/shared";
import type { DbClient } from "../db";

export class DrawingRepo {
  constructor(private readonly db: DbClient) {}

  async findAll(): Promise<Drawing[]> {
    return this.db.findMany<Drawing>("drawings");
  }

  async findById(id: string): Promise<Drawing | null> {
    return this.db.findFirst<Drawing>("drawings", { id });
  }

  async random(): Promise<Drawing | null> {
    const all = await this.findAll();
    if (all.length === 0) return null;
    return all[Math.floor(Math.random() * all.length)];
  }

  async insert(
    input: Omit<Drawing, "id">
  ): Promise<Drawing> {
    return this.db.insert<Drawing>("drawings", {
      id: uuid(),
      ...input,
    });
  }
}
