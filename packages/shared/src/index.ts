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
  hintsUsed: number;
};

export type GuessResponse = {
  correct: boolean;
  message: string;
  attemptsLeft: number;
  pointsAwarded: number | null;
};
