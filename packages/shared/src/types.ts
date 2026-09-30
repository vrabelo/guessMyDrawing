export type User = {
  id: string;
  alias: string;
  pass: string;
};

export type Drawing = {
  id: string;
  userId: string;
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  /** When true, drawing is in the play pool and locked for editing. */
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type GuessScore = {
  id: string;
  userId: string;
  points: number;
};

export type DrawScore = {
  id: string;
  userId: string;
  points: number;
};

export type ProgressStatus = "in_progress" | "solved" | "failed" | "expired";

export type UserDrawingProgress = {
  id: string;
  userId: string;
  drawingId: string;
  status: ProgressStatus;
  attemptsUsed: number;
  /** Single optional hint slot. */
  hintsRevealed: [boolean];
  /** True after a previous failed round — next solve awards half tipper points. */
  priorFailure: boolean;
  /** Epoch ms when the tipper first opened this drawing for guessing. */
  guessStartedAt: number | null;
  updatedAt: number;
};

export type PublicUser = {
  id: string;
  alias: string;
};

export type PublicDrawing = {
  id: string;
  uploaderId: string;
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  imageDataUrl: string;
  authorAlias: string;
  createdAt: number;
};

/** Owner-facing drawing including answer and publish state. */
export type OwnedDrawing = {
  id: string;
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  published: boolean;
  /** Points awarded to the drawer from successful guesses on this drawing. */
  drawerPointsEarned: number;
  createdAt: number;
  updatedAt: number;
};

export type AvailableDrawing = PublicDrawing & {
  progress: UserDrawingProgress | null;
  /** Only set when status is solved */
  answer?: string;
};

export type LeaderboardEntry = {
  userId: string;
  alias: string;
  points: number;
};

export type LeaderboardsResponse = {
  tippers: LeaderboardEntry[];
  creators: LeaderboardEntry[];
  overall: LeaderboardEntry[];
};

export type UserStatsResponse = {
  totalGuesses: number;
  totalPoints: number;
  drawingsCount: number;
  guessPoints: number;
  drawPoints: number;
  ranks: {
    tipper: number | null;
    creator: number | null;
    overall: number | null;
  };
};

/** Admin panel — count with change since previous admin login. */
export type AdminStatMetric = {
  total: number;
  delta: number;
};

export type AdminStatsResponse = {
  users: AdminStatMetric;
  drawings: AdminStatMetric;
  guessPoints: AdminStatMetric;
  drawPoints: AdminStatMetric;
  lastLoginAt: string | null;
};

export type AdminLoginRequest = {
  password: string;
};

export type AdminLoginResponse = {
  token: string;
  stats: AdminStatsResponse;
};

export type AdminDrawingRow = {
  id: string;
  name: string;
  theme: string;
  authorAlias: string;
  authorId: string;
  published: boolean;
  createdAt: number;
  updatedAt: number;
};

export type AdminUserRow = {
  id: string;
  alias: string;
  guessPoints: number;
  drawPoints: number;
  drawingsCount: number;
};

export type AdminDeleteUserRequest = {
  deleteDrawings?: boolean;
};

export type LoginRequest = {
  alias: string;
  pass: string;
};

export type RegisterRequest = {
  alias: string;
  pass: string;
};

export type LoginResponse = {
  token: string;
  user: PublicUser;
};

export type CreateDrawingRequest = {
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  published: boolean;
};

export type UpdateDrawingRequest = {
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  published: boolean;
};

export type GuessRequest = {
  guess: string;
};

export type GuessResponse = {
  correct: boolean;
  message: string;
  attemptsLeft: number;
  pointsAwarded: number | null;
  /** True when this was a final outcome (solved or failed round). */
  roundComplete: boolean;
  /** True when half-point retry multiplier was applied. */
  halfPointsApplied: boolean;
  progress: UserDrawingProgress;
  answer?: string;
};

export type PatchProgressRequest = {
  revealHint?: 1;
};

export type WsDrawingCreatedEvent = {
  type: "drawing.created";
  drawing: PublicDrawing;
};

export const MAX_GUESS_ATTEMPTS = 3;

/** Shared paint / display bitmap size (16:9). */
export const CANVAS_W = 640;
export const CANVAS_H = 360;
export const CANVAS_ASPECT = CANVAS_W / CANVAS_H;
