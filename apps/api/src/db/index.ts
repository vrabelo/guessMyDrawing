import path from "path";
import { JsonFileMockDb } from "./json-file-db";
import { createSeedData } from "./seed";
import type { DbClient } from "./client";

const DATA_PATH = path.join(__dirname, "..", "..", "data", "db.json");

export function createDb(): DbClient {
  return new JsonFileMockDb(DATA_PATH, createSeedData());
}

export type { DbClient } from "./client";
