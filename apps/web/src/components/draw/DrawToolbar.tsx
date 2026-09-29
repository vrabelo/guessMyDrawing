import type { ThemeCategoryId } from "@tipp-my-draw/shared";
import {
  THEME_CATEGORY_BADGE_LABELS,
  THEME_CATEGORY_IDS,
} from "@tipp-my-draw/shared";
import type { DrawMode } from "./DrawModeToggle";

export type ThemePick = "auto" | ThemeCategoryId;

type DrawToolbarProps = {
  drawMode: DrawMode;
  themePick: ThemePick;
  modeDisabled?: boolean;
  busy?: boolean;
  mustSave?: boolean;
  published?: boolean;
  onNewDrawing: () => void;
  onThemePickChange: (pick: ThemePick) => void;
  onFreeMode: () => void;
  onSave: () => void;
};

export function DrawToolbar({
  drawMode,
  themePick,
  modeDisabled = false,
  busy = false,
  mustSave = false,
  published = false,
  onNewDrawing,
  onThemePickChange,
  onFreeMode,
  onSave,
}: DrawToolbarProps) {
  return (
    <div className="draw-toolbar" role="toolbar" aria-label="Rajzolás">
      <button
        type="button"
        className="draw-toolbar__btn draw-toolbar__btn--secondary"
        disabled={busy || mustSave}
        onClick={onNewDrawing}
      >
        Új rajz
      </button>
      <select
        className={[
          "draw-toolbar__select",
          drawMode === "guided" ? "draw-toolbar__select--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        value={themePick}
        disabled={modeDisabled || busy || mustSave}
        aria-label="Ajánlott kategória"
        onChange={(e) => onThemePickChange(e.target.value as ThemePick)}
      >
        <option value="auto">Auto</option>
        {THEME_CATEGORY_IDS.map((id) => (
          <option key={id} value={id}>
            {THEME_CATEGORY_BADGE_LABELS[id]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={[
          "draw-toolbar__btn",
          drawMode === "free"
            ? "draw-toolbar__btn--primary"
            : "draw-toolbar__btn--secondary",
        ].join(" ")}
        disabled={modeDisabled}
        aria-pressed={drawMode === "free"}
        onClick={onFreeMode}
      >
        Szabad rajz
      </button>
      <button
        type="button"
        className="draw-toolbar__btn draw-toolbar__btn--primary"
        disabled={busy || published}
        onClick={onSave}
      >
        Mentés
      </button>
    </div>
  );
}
