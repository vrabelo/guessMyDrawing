import type { ThemeCategoryId } from "@tipp-my-draw/shared";
import {
  THEME_CATEGORY_BADGE_LABELS,
  THEME_CATEGORY_IDS,
} from "@tipp-my-draw/shared";

type DrawRecommendBarProps = {
  themeName: string;
  activeCategory: ThemeCategoryId;
  disabled?: boolean;
  onSelectCategory: (id: ThemeCategoryId) => void;
};

export function DrawRecommendBar({
  themeName,
  activeCategory,
  disabled = false,
  onSelectCategory,
}: DrawRecommendBarProps) {
  return (
    <div className="draw-recommend-bar" role="region" aria-label="Ajánlott téma">
      <p className="draw-recommend-bar__title">
        Ajánlott téma: &ldquo;{themeName}&rdquo;
      </p>
      <div className="draw-recommend-bar__badges" role="group" aria-label="Kategóriák">
        {THEME_CATEGORY_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={[
              "draw-recommend-badge",
              activeCategory === id ? "draw-recommend-badge--active" : "",
            ].join(" ")}
            disabled={disabled}
            onClick={() => onSelectCategory(id)}
          >
            {THEME_CATEGORY_BADGE_LABELS[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
