import { Button } from "../ui/Button";
import { GameRulesCopy } from "../game/GameRulesCopy";

type PlayIntroCardProps = {
  onStart: () => void;
  busy?: boolean;
};

export function PlayIntroCard({ onStart, busy = false }: PlayIntroCardProps) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-2">
      <div className="game-card max-h-full w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold text-[var(--ink)] sm:text-2xl">
          Hogyan működik a játék?
        </h2>
        <GameRulesCopy />
        <div className="flex justify-center">
          <Button
            label="Játék indítása. Kérem az első képet"
            variant="primary"
            disabled={busy}
            onClick={onStart}
          />
        </div>
      </div>
    </div>
  );
}
