export type {
  User,
  Drawing,
  GuessScore,
  DrawScore,
  ProgressStatus,
  UserDrawingProgress,
  PublicUser,
  PublicDrawing,
  OwnedDrawing,
  AvailableDrawing,
  LeaderboardEntry,
  LeaderboardsResponse,
  UserStatsResponse,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  CreateDrawingRequest,
  UpdateDrawingRequest,
  GuessRequest,
  GuessResponse,
  PatchProgressRequest,
  WsDrawingCreatedEvent,
} from "./types";

export {
  MAX_GUESS_ATTEMPTS,
  CANVAS_W,
  CANVAS_H,
  CANVAS_ASPECT,
} from "./types";

export {
  LETTER_GRACE_MS,
  GUESS_TIME_WINDOW_MS,
  DRAW_TIME_LIMIT_MS,
  LETTER_REVEAL_INTERVAL_MS,
  TIPPER_POINTS_NO_HINT,
  TIPPER_POINTS_WITH_HINT,
  TIPPER_MAX_POINTS,
  TIPPER_PENALTY_PER_SEC,
  tipperPointsForHints,
  drawerPointsForAttempt,
  applyRetryHalfPoints,
  awardTipperPoints,
  potentialTipperPoints,
} from "./scoring";

export {
  letterRevealCount,
  answerLetterCount,
  isAnswerFullyRevealed,
  shuffledLetterIndices,
  buildLetterMask,
} from "./letter-mask";

export {
  THEME_DATABASE,
  THEME_COUNT,
  THEME_CATEGORY_IDS,
  THEME_CATEGORY_LABELS,
  THEME_CATEGORY_BADGE_LABELS,
  THEMES_BY_CATEGORY,
  pickRandomTheme,
  pickRandomFromCategory,
  listThemeCategories,
  type ThemeCategory,
  type ThemeCategoryId,
  type ThemeEntry,
} from "./themes";
