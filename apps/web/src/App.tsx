import { useCallback, useEffect, useState } from "react";
import type { LeaderboardsResponse } from "@tipp-my-draw/shared";
import { Button } from "./components/ui/Button";
import { api, clearSession, getStoredUser } from "./api/client";
import { AuthScreen } from "./features/AuthScreen";
import { ModeToggle, type AppMode } from "./features/ModeToggle";
import { PlayPanel } from "./features/PlayPanel";
import { DrawPanel } from "./features/DrawPanel";
import { Leaderboards } from "./features/Leaderboards";

export default function App() {
  const [user, setUser] = useState<{ id: string; alias: string } | null>(() =>
    getStoredUser()
  );
  const [mode, setMode] = useState<AppMode>("play");
  const [boards, setBoards] = useState<LeaderboardsResponse | null>(null);

  const refreshBoards = useCallback(async () => {
    try {
      const data = await api.leaderboards();
      setBoards(data);
    } catch {
      setBoards(null);
    }
  }, []);

  useEffect(() => {
    if (user) void refreshBoards();
  }, [user, refreshBoards]);

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AuthScreen onLoggedIn={setUser} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tipp my draw</h1>
          <p className="text-sm text-stone-500">Bejelentkezve: {user.alias}</p>
        </div>
        <Button
          label="Kijelentkezés"
          variant="ghost"
          onClick={() => {
            clearSession();
            setUser(null);
          }}
        />
      </header>

      <ModeToggle mode={mode} onChange={setMode} />

      <div className="mt-6">
        {mode === "play" ? (
          <PlayPanel onScored={() => void refreshBoards()} />
        ) : (
          <DrawPanel onSaved={() => void refreshBoards()} />
        )}
      </div>

      <Leaderboards data={boards} />
    </main>
  );
}
