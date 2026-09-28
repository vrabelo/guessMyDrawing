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
    <section
      className={[
        "min-w-0 flex-1 rounded-2xl bg-[var(--panel)] p-4",
        "shadow-xl shadow-black/40 ring-1 ring-white/5",
      ].join(" ")}
    >
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {title}
      </h3>
      <ol className="space-y-1.5 text-xs">
        {entries.length === 0 ? (
          <li className="text-[var(--muted)]">Nincs adat</li>
        ) : (
          entries.map((e, i) => (
            <li
              key={e.userId}
              className="flex justify-between gap-2 border-b border-white/5 py-1 last:border-0"
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
    </section>
  );
}

export function Leaderboards({ data }: LeaderboardsProps) {
  return (
    <div className="mt-8 flex flex-row gap-4 overflow-x-auto pb-2">
      <Board title="Top 10 tippelő" entries={data?.tippers ?? []} />
      <Board title="Top 10 rajzoló" entries={data?.creators ?? []} />
      <Board title="Top 10 összesített" entries={data?.overall ?? []} />
    </div>
  );
}
