import { Button } from "../../components/ui/Button";

type PuzzleImageCardProps = {
  src: string;
  authorAlias: string;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export function PuzzleImageCard({
  src,
  authorAlias,
  index,
  total,
  onPrev,
  onNext,
}: PuzzleImageCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={[
          "h-[360px] w-[360px] max-w-[min(360px,85vw)] overflow-hidden rounded-2xl",
          "bg-[var(--panel-elevated)] ring-1 ring-white/10",
          "shadow-[0_0_40px_rgba(45,212,191,0.15),0_20px_40px_rgba(0,0,0,0.45)]",
        ].join(" ")}
      >
        <img
          src={src}
          alt="Feladvány"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <p className="text-xs text-[var(--muted)]">@{authorAlias}</p>

      <div className="flex items-center gap-2">
        <Button
          label="←"
          variant="secondary"
          onClick={onPrev}
          disabled={index <= 0}
          className="!min-w-10 !px-0 !py-2 shadow-lg shadow-black/30"
        />
        <span className="min-w-10 text-center text-xs text-[var(--muted)]">
          {index + 1}/{total}
        </span>
        <Button
          label="→"
          variant="secondary"
          onClick={onNext}
          disabled={index >= total - 1}
          className="!min-w-10 !px-0 !py-2 shadow-lg shadow-black/30"
        />
      </div>
    </div>
  );
}
