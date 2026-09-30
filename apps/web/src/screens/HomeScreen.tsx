import { Button } from "../components/ui/Button";
import { GameRulesCopy } from "../components/game/GameRulesCopy";
import "../components/play/play-screen.css";

type HomeScreenProps = {
  onChoosePlay: () => void;
};

export function HomeScreen({ onChoosePlay }: HomeScreenProps) {
  return (
    <div className="home-screen">
      <div className="game-card max-h-full w-full max-w-2xl overflow-y-auto p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold text-[var(--ink)] sm:text-2xl">
          Hogyan működik a játék?
        </h2>
        <GameRulesCopy />
        <div className="home-screen__cta">
          <Button label="Ok" variant="outline" onClick={onChoosePlay} />
        </div>
      </div>
    </div>
  );
}
