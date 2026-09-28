import type {
  AvailableDrawing,
  Drawing,
  OwnedDrawing,
  PublicDrawing,
  UserDrawingProgress,
} from "@tipp-my-draw/shared";
import type { UserRepo } from "../repos/user-repo";

export function isPublished(d: Drawing): boolean {
  return d.published !== false;
}

export async function toPublicDrawing(
  drawing: Drawing,
  users: UserRepo
): Promise<PublicDrawing> {
  const author = await users.findById(drawing.userId);
  return {
    id: drawing.id,
    uploaderId: drawing.userId,
    theme: drawing.theme?.trim() || "",
    hint1: drawing.hint1,
    hint2: drawing.hint2,
    hint3: drawing.hint3,
    imageDataUrl: drawing.imageDataUrl,
    authorAlias: author?.alias ?? "ismeretlen",
    createdAt: drawing.createdAt ?? 0,
  };
}

export function toOwnedDrawing(drawing: Drawing): OwnedDrawing {
  return {
    id: drawing.id,
    theme: drawing.theme?.trim() || "",
    hint1: drawing.hint1,
    hint2: drawing.hint2,
    hint3: drawing.hint3,
    name: drawing.name,
    imageDataUrl: drawing.imageDataUrl,
    published: isPublished(drawing),
    createdAt: drawing.createdAt ?? 0,
    updatedAt: drawing.updatedAt ?? drawing.createdAt ?? 0,
  };
}

export function withProgress(
  pub: PublicDrawing,
  progress: UserDrawingProgress | null,
  answer?: string
): AvailableDrawing {
  return {
    ...pub,
    progress,
    ...(answer != null ? { answer } : {}),
  };
}

export function normalizeProgress(
  p: UserDrawingProgress
): UserDrawingProgress {
  const raw = p.hintsRevealed as boolean[] | undefined;
  const anyHint = Array.isArray(raw) ? raw.some(Boolean) : false;
  return {
    ...p,
    priorFailure: Boolean(p.priorFailure),
    guessStartedAt: p.guessStartedAt ?? null,
    hintsRevealed: [anyHint],
  };
}
