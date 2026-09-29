import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LeaderboardsResponse,
  UserStatsResponse,
} from "@tipp-my-draw/shared";
import { api, clearSession, getStoredUser } from "./api/client";
import { AuthScreen } from "./screens/AuthScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { DrawScreen } from "./screens/DrawScreen";
import type { AppMode } from "./components/shell/ModeToggle";
import { AppHeader } from "./components/shell/AppHeader";
import "./components/shell/app-shell.css";

type AppView = "home" | AppMode;

export default function App() {
  const [user, setUser] = useState<{ id: string; alias: string } | null>(() =>
    getStoredUser()
  );
  const [view, setView] = useState<AppView>("home");
  const [boards, setBoards] = useState<LeaderboardsResponse | null>(null);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const discardDrawRef = useRef<() => void>(() => {});

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

  function leaveDrawIfNeeded() {
    if (view === "draw") discardDrawRef.current();
  }

  function handleModeChange(mode: AppMode) {
    if (view === "draw" && mode !== "draw") discardDrawRef.current();
    setView(mode);
  }

  if (!user) {
    return (
      <main className="auth-screen-main">
        <AuthScreen onLoggedIn={setUser} />
      </main>
    );
  }

  const gridClass =
    view === "home"
      ? "app-shell__grid app-shell__grid--home"
      : "app-shell__grid app-shell__grid--game";

  return (
    <main className="app-shell">
      <AppHeader
        onGoHome={() => {
          leaveDrawIfNeeded();
          setView("home");
        }}
        onLogout={() => {
          leaveDrawIfNeeded();
          clearSession();
          setUser(null);
          setView("home");
        }}
      />

      <div className={gridClass}>
        {view === "home" ? (
          <HomeScreen onChoosePlay={() => setView("play")} />
        ) : view === "play" ? (
          <PlayScreen
            onScored={() => void refreshSideData()}
            onModeChange={handleModeChange}
            alias={user.alias}
            stats={stats}
            boards={boards}
          />
        ) : (
          <DrawScreen
            onSaved={() => void refreshSideData()}
            onModeChange={handleModeChange}
            alias={user.alias}
            stats={stats}
            onBindDiscard={(fn) => {
              discardDrawRef.current = fn;
            }}
          />
        )}
      </div>
    </main>
  );
}
