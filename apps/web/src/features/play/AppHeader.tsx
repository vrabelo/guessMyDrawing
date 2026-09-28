import { Button } from "../../components/ui/Button";

type AppHeaderProps = {
  alias: string;
  onLogout: () => void;
};

export function AppHeader({ alias, onLogout }: AppHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-1 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
          Tipp{" "}
          <span className="bg-gradient-to-r from-[var(--accent)] to-[#5eead4] bg-clip-text text-transparent">
            my draw
          </span>
        </h1>
        <p className="text-xs text-[var(--muted)] sm:text-sm">@{alias}</p>
      </div>
      <Button label="Kijelentkezés" variant="ghost" onClick={onLogout} />
    </header>
  );
}
