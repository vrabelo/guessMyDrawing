import type { LeaderboardEntry, LeaderboardsResponse } from "@tipp-my-draw/shared";
import { Card } from "../../components/ui/Card";

type LeaderboardsProps = {
  data: LeaderboardsResponse | null;
};

function Board({
  title,
  entries,
}: {
  title: string;
  entries: LeaderboardEntry[];
}) {
  return (
    <Card title={title} className="min-w-0 flex-1" padding="sm">
      <ol className="space-y-1 text-xs">
        {entries.length === 0 ? (
          <li className="text-[var(--muted)]">Nincs adat</li>
        ) : (
          entries.map((e, i) => (
            <li
              key={e.userId}
              className="flex justify-between gap-1 border-b border-[var(--border)] py-1 last:border-0"
            >
              <span className="truncate text-[var(--ink)]">
                {i + 1}. {e.alias}
              </span>
              <span className="shrink-0 font-medium tabular-nums text-[var(--muted)]">
                {e.points}
              </span>
            </li>
          ))
        )}
      </ol>
    </Card>
  );
}

export function Leaderboards({ data }: LeaderboardsProps) {
  return (
    <div className="mt-6 flex flex-row gap-3 overflow-x-auto">
      <Board title="Top 10 tippelő" entries={data?.tippers ?? []} />
      <Board title="Top 10 rajzoló" entries={data?.creators ?? []} />
      <Board title="Top 10 összesített" entries={data?.overall ?? []} />
    </div>
  );
}
