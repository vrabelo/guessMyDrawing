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
    <div className="flex flex-col items-center gap-3">
      <div
        className={[
          "h-[450px] w-[450px] max-w-full overflow-hidden rounded-2xl",
          "bg-[var(--panel-elevated)] shadow-xl shadow-black/45",
          "ring-1 ring-white/5",
        ].join(" ")}
      >
        <img
          src={src}
          alt="Feladvány"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <p className="text-xs text-[var(--muted)]">Rajzoló: {authorAlias}</p>

      <div className="flex items-center gap-3">
        <Button
          label="←"
          variant="secondary"
          onClick={onPrev}
          disabled={index <= 0}
          className="!min-w-11 !rounded-full !px-0 shadow-lg shadow-black/30"
        />
        <span className="min-w-12 text-center text-xs text-[var(--muted)]">
          {index + 1} / {total}
        </span>
        <Button
          label="→"
          variant="secondary"
          onClick={onNext}
          disabled={index >= total - 1}
          className="!min-w-11 !rounded-full !px-0 shadow-lg shadow-black/30"
        />
      </div>
    </div>
  );
}
