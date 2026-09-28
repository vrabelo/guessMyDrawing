import { BookOpen, HelpCircle, Info } from "lucide-react";

const items = [
  { id: "info", label: "Infó", icon: Info },
  { id: "help", label: "Súgó", icon: HelpCircle },
  { id: "guide", label: "Útmutató", icon: BookOpen },
] as const;

export function PlaySideRail() {
  return (
    <aside className="play-side-rail" aria-label="Gyorsinfó">
      {items.map(({ id, label, icon: Icon }) => (
        <div key={id} className="play-side-rail__item">
          <button
            type="button"
            className="play-side-rail__btn"
            aria-label={label}
          >
            <Icon className="play-side-rail__icon" strokeWidth={2.25} aria-hidden />
          </button>
          <div className="play-side-rail__tooltip" role="tooltip">
            Lorem ipsum
          </div>
        </div>
      ))}
    </aside>
  );
}
