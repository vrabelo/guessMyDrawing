import type { LeaderboardsResponse, UserStatsResponse } from "@tipp-my-draw/shared";
import { UserStatsCard } from "./UserStatsCard";
import { TabbedLeaderboards } from "./TabbedLeaderboards";

type SidePanelProps = {
  alias: string;
  stats: UserStatsResponse | null;
  boards: LeaderboardsResponse | null;
};

export function SidePanel({ alias, stats, boards }: SidePanelProps) {
  return (
    <aside className="side-panel flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-hidden">
      <UserStatsCard alias={alias} stats={stats} />
      <TabbedLeaderboards data={boards} />
    </aside>
  );
}
