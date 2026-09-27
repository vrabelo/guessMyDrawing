import fs from "fs";
import path from "path";
import type { DbClient, FindManyOptions, TableName } from "./client";

type DbShape = Record<TableName, Record<string, unknown>[]>;

function matchesWhere<T extends Record<string, unknown>>(
  row: T,
  where?: Partial<T>
): boolean {
  if (!where) return true;
  return Object.entries(where).every(([key, value]) => row[key] === value);
}

export class JsonFileMockDb implements DbClient {
  private data: DbShape;

  constructor(
    private readonly filePath: string,
    seed: DbShape
  ) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      this.data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as DbShape;
    } else {
      this.data = structuredClone(seed);
      this.persist();
    }
  }

  private persist(): void {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
  }

  async findMany<T extends Record<string, unknown>>(
    table: TableName,
    opts?: FindManyOptions<T>
  ): Promise<T[]> {
    let rows = (this.data[table] as T[]).filter((row) =>
      matchesWhere(row, opts?.where)
    );

    if (opts?.orderBy) {
      const { field, dir } = opts.orderBy;
      rows = [...rows].sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : 1;
        return dir === "asc" ? cmp : -cmp;
      });
    }

    if (opts?.limit != null) {
      rows = rows.slice(0, opts.limit);
    }

    return structuredClone(rows);
  }

  async findFirst<T extends Record<string, unknown>>(
    table: TableName,
    where: Partial<T>
  ): Promise<T | null> {
    const rows = await this.findMany<T>(table, { where, limit: 1 });
    return rows[0] ?? null;
  }

  async insert<T extends Record<string, unknown>>(
    table: TableName,
    row: T
  ): Promise<T> {
    const copy = structuredClone(row);
    this.data[table].push(copy);
    this.persist();
    return structuredClone(copy);
  }

  async update<T extends Record<string, unknown>>(
    table: TableName,
    where: Partial<T>,
    patch: Partial<T>
  ): Promise<T | null> {
    const rows = this.data[table] as T[];
    const index = rows.findIndex((row) => matchesWhere(row, where));
    if (index < 0) return null;
    rows[index] = { ...rows[index], ...patch };
    this.persist();
    return structuredClone(rows[index]);
  }

  async delete(
    table: TableName,
    where: Record<string, unknown>
  ): Promise<number> {
    const before = this.data[table].length;
    this.data[table] = this.data[table].filter(
      (row) => !matchesWhere(row, where)
    );
    const removed = before - this.data[table].length;
    if (removed > 0) this.persist();
    return removed;
  }
}
