import { useState } from "react";
import type { LeaderboardEntry, LeaderboardsResponse } from "@tipp-my-draw/shared";

type TabbedLeaderboardsProps = {
  data: LeaderboardsResponse | null;
};

type TabId = "tippers" | "creators" | "overall";

const tabs: { id: TabId; label: string }[] = [
  { id: "tippers", label: "Tippelő" },
  { id: "creators", label: "Rajzoló" },
  { id: "overall", label: "Összes" },
];

function BoardList({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-[var(--muted)]">Nincs adat</p>
    );
  }

  return (
    <ol className="space-y-0.5">
      {entries.slice(0, 10).map((e, i) => (
        <li
          key={e.userId}
          className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                i < 3
                  ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "bg-white/[0.05] text-[var(--muted)]",
              ].join(" ")}
            >
              {i + 1}
            </span>
            <span className="truncate text-[12px] font-medium text-[var(--muted-strong)]">
              {e.alias}
            </span>
          </span>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--accent)]">
            {e.points}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function TabbedLeaderboards({ data }: TabbedLeaderboardsProps) {
  const [tab, setTab] = useState<TabId>("tippers");

  const entries =
    tab === "tippers"
      ? (data?.tippers ?? [])
      : tab === "creators"
        ? (data?.creators ?? [])
        : (data?.overall ?? []);

  return (
    <section className="game-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-[var(--border)] px-4 pt-4">
        <h3 className="game-card-title mb-3">Top 10</h3>
        <div
          className="flex gap-0.5"
          role="tablist"
          aria-label="Ranglista típus"
        >
          {tabs.map((t) => {
            const selected = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.id)}
                className={[
                  "relative flex-1 rounded-t-md px-1.5 pb-2.5 pt-1.5 text-[11px] font-semibold tracking-wide transition-colors duration-200",
                  selected
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--muted-strong)]",
                ].join(" ")}
              >
                {t.label}
                <span
                  className={[
                    "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-all duration-200",
                    selected
                      ? "bg-[var(--accent)] opacity-100 shadow-[0_0_10px_rgba(45,212,191,0.55)]"
                      : "bg-transparent opacity-0",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        <BoardList entries={entries} />
      </div>
    </section>
  );
}
