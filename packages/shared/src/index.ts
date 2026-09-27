export type User = {
  id: string;
  alias: string;
  pass: string;
};

export type Drawing = {
  id: string;
  userId: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
  createdAt: number;
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

export type ProgressStatus = "in_progress" | "solved" | "failed";

export type UserDrawingProgress = {
  id: string;
  userId: string;
  drawingId: string;
  status: ProgressStatus;
  attemptsUsed: number;
  hintsRevealed: [boolean, boolean, boolean];
  updatedAt: number;
};

export type PublicUser = {
  id: string;
  alias: string;
};

export type PublicDrawing = {
  id: string;
  uploaderId: string;
  hint1: string;
  hint2: string;
  hint3: string;
  imageDataUrl: string;
  authorAlias: string;
  createdAt: number;
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

export type LoginRequest = {
  alias: string;
  pass: string;
};

export type LoginResponse = {
  token: string;
  user: PublicUser;
};

export type CreateDrawingRequest = {
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
  imageDataUrl: string;
};

export type GuessRequest = {
  guess: string;
};

export type GuessResponse = {
  correct: boolean;
  message: string;
  attemptsLeft: number;
  pointsAwarded: number | null;
  progress: UserDrawingProgress;
  answer?: string;
};

export type PatchProgressRequest = {
  revealHint?: 1 | 2 | 3;
};

export type WsDrawingCreatedEvent = {
  type: "drawing.created";
  drawing: PublicDrawing;
};
