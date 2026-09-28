import { useCallback, useEffect, useState } from "react";
import type {
  LeaderboardsResponse,
  UserStatsResponse,
} from "@tipp-my-draw/shared";
import { api, clearSession, getStoredUser } from "./api/client";
import { AuthScreen } from "./features/AuthScreen";
import type { AppMode } from "./features/ModeToggle";
import { PlayPanel } from "./features/PlayPanel";
import { DrawPanel } from "./features/DrawPanel";
import { SidePanel } from "./features/SidePanel";
import { AppHeader } from "./features/play/AppHeader";

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
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-6">
        <AuthScreen onLoggedIn={setUser} />
      </main>
    );
  }

  const gridClass =
    mode === "play"
      ? "grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-[minmax(0,1fr)_260px]"
      : "grid min-h-0 flex-1 grid-cols-1 overflow-hidden";

  return (
    <main className="mx-auto flex h-screen max-h-screen max-w-[1400px] flex-col gap-2.5 overflow-hidden px-4 py-2.5 sm:px-6">
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
            <PlayPanel onScored={() => void refreshSideData()} />
            <SidePanel
              alias={user.alias}
              stats={stats}
              boards={boards}
              alignWithImage
            />
          </>
        ) : (
          <DrawPanel onSaved={() => void refreshSideData()} />
        )}
      </div>
    </main>
  );
}
