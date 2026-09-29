import type { ThemeCategoryId } from "@tipp-my-draw/shared";
import {
  THEME_CATEGORY_BADGE_LABELS,
  THEME_CATEGORY_IDS,
} from "@tipp-my-draw/shared";

export type ThemePick = "auto" | "free" | ThemeCategoryId;

const CATEGORY_OPTIONS = [...THEME_CATEGORY_IDS].sort((a, b) =>
  THEME_CATEGORY_BADGE_LABELS[a].localeCompare(
    THEME_CATEGORY_BADGE_LABELS[b],
    "hu"
  )
);

type DrawToolbarProps = {
  themePick: ThemePick;
  modeDisabled?: boolean;
  busy?: boolean;
  mustSave?: boolean;
  onNewDrawing: () => void;
  onThemePickChange: (pick: ThemePick) => void;
};

export function DrawToolbar({
  themePick,
  modeDisabled = false,
  busy = false,
  mustSave = false,
  onNewDrawing,
  onThemePickChange,
}: DrawToolbarProps) {
  return (
    <div className="draw-toolbar" role="toolbar" aria-label="Rajzolás">
      <button
        type="button"
        className="draw-toolbar__btn draw-toolbar__btn--secondary"
        disabled={busy || mustSave}
        onClick={onNewDrawing}
      >
        Új téma
      </button>
      <select
        className={[
          "draw-toolbar__select",
          themePick !== "free" ? "draw-toolbar__select--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        value={themePick}
        disabled={modeDisabled || busy || mustSave}
        aria-label="Kategória"
        onChange={(e) => onThemePickChange(e.target.value as ThemePick)}
      >
        <option value="auto">Auto</option>
        <option value="free">Szabad rajz</option>
        {CATEGORY_OPTIONS.map((id) => (
          <option key={id} value={id}>
            {THEME_CATEGORY_BADGE_LABELS[id]}
          </option>
        ))}
      </select>
    </div>
  );
}
