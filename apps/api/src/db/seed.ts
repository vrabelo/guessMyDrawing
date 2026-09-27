import { v4 as uuid } from "uuid";
import type {
  Drawing,
  DrawScore,
  GuessScore,
  User,
} from "@tipp-my-draw/shared";

/** Tiny placeholder PNG (1x1 light gray) as data URL for seed drawing. */
const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFUlEQVQYV2P8z8BQz0AEYBxVSF+FABJADveWkH/aAAAAAElFTkSuQmCC";

export function createSeedData(): {
  users: User[];
  drawings: Drawing[];
  guess_scores: GuessScore[];
  draw_scores: DrawScore[];
} {
  const belaId = uuid();
  const feriId = uuid();
  const tibiId = uuid();

  const users: User[] = [
    { id: belaId, alias: "Bela", pass: "bela" },
    { id: feriId, alias: "Feri", pass: "feri" },
    { id: tibiId, alias: "Tibi", pass: "tibi" },
  ];

  const guess_scores: GuessScore[] = [
    { id: uuid(), userId: belaId, points: 0 },
    { id: uuid(), userId: feriId, points: 0 },
    { id: uuid(), userId: tibiId, points: 0 },
  ];

  const draw_scores: DrawScore[] = [
    { id: uuid(), userId: belaId, points: 0 },
    { id: uuid(), userId: feriId, points: 0 },
    { id: uuid(), userId: tibiId, points: 0 },
  ];

  const drawings: Drawing[] = [
    {
      id: uuid(),
      userId: belaId,
      hint1: "Négylábú",
      hint2: "Ugat",
      hint3: "Man's best friend",
      name: "kutya",
      imageDataUrl: PLACEHOLDER_IMAGE,
    },
  ];

  return { users, drawings, guess_scores, draw_scores };
}
