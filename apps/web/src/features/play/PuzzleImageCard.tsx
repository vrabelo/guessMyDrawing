import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

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
    <Card title="Feladvány" className="min-h-[22rem]" padding="md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button
          label="←"
          variant="secondary"
          onClick={onPrev}
          disabled={index <= 0}
          className="!min-w-12 !px-0"
        />
        <span className="text-xs text-[var(--muted)]">
          {index + 1} / {total}
        </span>
        <Button
          label="→"
          variant="secondary"
          onClick={onNext}
          disabled={index >= total - 1}
          className="!min-w-12 !px-0"
        />
      </div>

      <div className="flex min-h-[16rem] items-center justify-center rounded-2xl bg-[var(--panel-elevated)] p-4">
        <img
          src={src}
          alt="Feladvány"
          className="max-h-72 w-full max-w-full object-contain"
        />
      </div>

      <p className="mt-3 text-xs text-[var(--muted)]">Rajzoló: {authorAlias}</p>
    </Card>
  );
}
