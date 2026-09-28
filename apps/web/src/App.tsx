import { useCallback, useEffect, useState } from "react";
import type {
  LeaderboardsResponse,
  UserStatsResponse,
} from "@tipp-my-draw/shared";
import { api, clearSession, getStoredUser } from "./api/client";
import { AuthScreen } from "./screens/AuthScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { DrawScreen } from "./screens/DrawScreen";
import type { AppMode } from "./components/shell/ModeToggle";
import { SidePanel } from "./components/shell/SidePanel";
import { AppHeader } from "./components/shell/AppHeader";
import "./components/shell/app-shell.css";

export default function App() {
  const [user, setUser] = useState<{ id: string; alias: string } | null>(() =>
    getStoredUser()
  );
  const [mode, setMode] = useState<AppMode>("play");
  const [boards, setBoards] = useState<LeaderboardsResponse | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);

  const refreshSideData = useCallback(async () => {
    try {
      const [lb, me] = await Promise.all([
        api.leaderboards(),
        api.myStats(),
      ]);
      setBoards(lb);
      setStats(me);
    } catch {
      setBoards(null);
      setStats(null);
    }
  }, []);

  useEffect(() => {
    if (user) void refreshSideData();
  }, [user, refreshSideData]);

  if (!user) {
    return (
      <main className="auth-screen-main">
        <AuthScreen onLoggedIn={setUser} />
      </main>
    );
  }

  const gridClass =
    mode === "play"
      ? "app-shell__grid app-shell__grid--play"
      : "app-shell__grid app-shell__grid--draw";

  return (
    <main className="app-shell">
      <AppHeader
        mode={mode}
        onModeChange={setMode}
        onLogout={() => {
          clearSession();
          setUser(null);
        }}
      />

      <div className={gridClass}>
        {mode === "play" ? (
          <>
            <PlayScreen onScored={() => void refreshSideData()} />
            <SidePanel
              alias={user.alias}
              stats={stats}
              boards={boards}
              alignWithImage
            />
          </>
        ) : (
          <DrawScreen onSaved={() => void refreshSideData()} />
        )}
      </div>
    </main>
  );
}
