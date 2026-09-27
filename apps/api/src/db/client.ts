export type TableName = "users" | "drawings" | "guess_scores" | "draw_scores";

export type FindManyOptions<T> = {
  where?: Partial<T>;
  orderBy?: { field: keyof T & string; dir: "asc" | "desc" };
  limit?: number;
};

export interface DbClient {
  findMany<T extends Record<string, unknown>>(
    table: TableName,
    opts?: FindManyOptions<T>
  ): Promise<T[]>;
  findFirst<T extends Record<string, unknown>>(
    table: TableName,
    where: Partial<T>
  ): Promise<T | null>;
  insert<T extends Record<string, unknown>>(
    table: TableName,
    row: T
  ): Promise<T>;
  update<T extends Record<string, unknown>>(
    table: TableName,
    where: Partial<T>,
    patch: Partial<T>
  ): Promise<T | null>;
  delete(
    table: TableName,
    where: Record<string, unknown>
  ): Promise<number>;
}
