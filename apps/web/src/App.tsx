import { useCallback, useEffect, useState } from "react";
import type { LeaderboardsResponse } from "@tipp-my-draw/shared";
import { api, clearSession, getStoredUser } from "./api/client";
import { AuthScreen } from "./features/AuthScreen";
import { type AppMode } from "./features/ModeToggle";
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
      <main className="mx-auto max-w-5xl px-4 py-6">
        <AuthScreen onLoggedIn={setUser} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <AppHeader
        alias={user.alias}
        mode={mode}
        onModeChange={setMode}
        onLogout={() => {
          clearSession();
          setUser(null);
        }}
      />

      <div>
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
