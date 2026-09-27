import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ModeToggle, type AppMode } from "../ModeToggle";

type AppHeaderProps = {
  alias: string;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onLogout: () => void;
};

export function AppHeader({
  alias,
  mode,
  onModeChange,
  onLogout,
}: AppHeaderProps) {
  return (
    <Card className="mb-6" padding="md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Tipp my draw
          </h1>
          <p className="text-sm text-[var(--muted)]">Bejelentkezve: {alias}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ModeToggle mode={mode} onChange={onModeChange} />
          <Button label="Kijelentkezés" variant="ghost" onClick={onLogout} />
        </div>
      </div>
    </Card>
  );
}
