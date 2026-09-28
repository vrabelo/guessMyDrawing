import type { LeaderboardsResponse, UserStatsResponse } from "@tipp-my-draw/shared";
import { UserStatsCard } from "./UserStatsCard";
import { TabbedLeaderboards } from "./TabbedLeaderboards";

type SidePanelProps = {
  alias: string;
  stats: UserStatsResponse | null;
  boards: LeaderboardsResponse | null;
  /** Offset top to match the main image container (below theme row). */
  alignWithImage?: boolean;
};

export function SidePanel({
  alias,
  stats,
  boards,
  alignWithImage = false,
}: SidePanelProps) {
  return (
    <aside
      className={[
        "flex w-[260px] shrink-0 flex-col gap-3 self-stretch overflow-hidden",
        alignWithImage ? "side-panel--align-image" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <UserStatsCard alias={alias} stats={stats} />
      <TabbedLeaderboards data={boards} />
    </aside>
  );
}
