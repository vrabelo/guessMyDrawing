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
  const top = entries.slice(0, 5);
  return (
    <section
      className={[
        "min-w-0 flex-1 rounded-2xl bg-[var(--panel)]/90 px-3 py-2.5 backdrop-blur-sm",
        "shadow-[0_8px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/8",
      ].join(" ")}
    >
      <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {title}
      </h3>
      <ol className="max-h-[5.5rem] space-y-0.5 overflow-y-auto text-[11px]">
        {top.length === 0 ? (
          <li className="text-[var(--muted)]">Nincs adat</li>
        ) : (
          top.map((e, i) => (
            <li key={e.userId} className="flex justify-between gap-2 py-0.5">
              <span className="truncate text-[var(--ink)]">
                {i + 1}. {e.alias}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--accent)]">
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
    <div className="flex shrink-0 flex-row gap-3">
      <Board title="Top tippelő" entries={data?.tippers ?? []} />
      <Board title="Top rajzoló" entries={data?.creators ?? []} />
      <Board title="Top összes" entries={data?.overall ?? []} />
    </div>
  );
}
