import { useCallback, useEffect, useState } from "react";
import type { LeaderboardsResponse } from "@tipp-my-draw/shared";
import { api, clearSession, getStoredUser } from "./api/client";
import { AuthScreen } from "./features/AuthScreen";
import { ModeToggle, type AppMode } from "./features/ModeToggle";
import { PlayPanel } from "./features/PlayPanel";
import { DrawPanel } from "./features/DrawPanel";
import { Leaderboards } from "./features/Leaderboards";
import { AppHeader } from "./features/play/AppHeader";

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
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-6">
        <AuthScreen onLoggedIn={setUser} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-screen max-h-screen max-w-6xl flex-col gap-3 overflow-hidden px-4 py-3">
      <AppHeader
        alias={user.alias}
        onLogout={() => {
          clearSession();
          setUser(null);
        }}
      />

      <ModeToggle mode={mode} onChange={setMode} />

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === "play" ? (
          <PlayPanel onScored={() => void refreshBoards()} />
        ) : (
          <div className="h-full overflow-auto pb-2">
            <DrawPanel onSaved={() => void refreshBoards()} />
          </div>
        )}
      </div>

      <Leaderboards data={boards} />
    </main>
  );
}
