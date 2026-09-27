import type { LeaderboardEntry, LeaderboardsResponse } from "@tipp-my-draw/shared";

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
    <section className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--panel)] p-2 sm:p-3">
      <h3 className="mb-2 truncate text-xs font-semibold uppercase tracking-wide text-stone-500">
        {title}
      </h3>
      <ol className="space-y-0.5 text-xs">
        {entries.length === 0 ? (
          <li className="text-stone-400">Nincs adat</li>
        ) : (
          entries.map((e, i) => (
            <li
              key={e.userId}
              className="flex justify-between gap-1 border-b border-stone-100 py-0.5 last:border-0"
            >
              <span className="truncate">
                {i + 1}. {e.alias}
              </span>
              <span className="shrink-0 font-medium tabular-nums">{e.points}</span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}

export function Leaderboards({ data }: LeaderboardsProps) {
  return (
    <div className="mt-6 flex flex-row gap-2 overflow-x-auto">
      <Board title="Top 10 tippelő" entries={data?.tippers ?? []} />
      <Board title="Top 10 rajzoló" entries={data?.creators ?? []} />
      <Board title="Top 10 összesített" entries={data?.overall ?? []} />
    </div>
  );
}
