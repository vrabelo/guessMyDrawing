import type { UserStatsResponse } from "@tipp-my-draw/shared";

type UserStatsCardProps = {
  alias: string;
  stats: UserStatsResponse | null;
  /** Tip page (default) or draw-focused stats. */
  mode?: "play" | "draw";
};

function StatRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-[12px] font-medium tracking-wide text-[var(--muted)]">
        {label}
      </span>
      <span
        className={[
          "text-sm font-semibold tabular-nums",
          accent ? "text-[var(--highlight)]" : "text-[var(--ink)]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function formatRank(rank: number | null): string {
  return rank == null ? "—" : `${rank}.`;
}

export function UserStatsCard({
  alias,
  stats,
  mode = "play",
}: UserStatsCardProps) {
  if (mode === "draw") {
    return (
      <section className="game-card shrink-0 px-4 py-4">
        <p className="mb-3 truncate text-base font-semibold text-[var(--ink)]">
          {alias}
        </p>

        <div className="divide-y divide-white/[0.06]">
          <StatRow
            label="Rajzaid száma"
            value={stats?.drawingsCount ?? "—"}
          />
          <StatRow
            label="Rajzpontjaid"
            value={stats?.drawPoints ?? "—"}
            accent
          />
          <StatRow
            label="Rajz helyezés"
            value={formatRank(stats?.ranks.creator ?? null)}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="game-card shrink-0 px-4 py-4">
      <p className="mb-3 truncate text-base font-semibold text-[var(--ink)]">
        {alias}
      </p>

      <div className="divide-y divide-white/[0.06]">
        <StatRow
          label="Összes tipped"
          value={stats?.totalGuesses ?? "—"}
        />
        <StatRow
          label="Pontjaid száma"
          value={stats?.totalPoints ?? "—"}
          accent
        />
        <StatRow
          label="Rajzaid száma"
          value={stats?.drawingsCount ?? "—"}
        />
      </div>

      <div className="mt-3 border-t border-white/[0.06] pt-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Helyezés
        </p>
        <StatRow
          label="Tipp helyezés"
          value={formatRank(stats?.ranks.tipper ?? null)}
        />
        <StatRow
          label="Rajz helyezés"
          value={formatRank(stats?.ranks.creator ?? null)}
        />
        <StatRow
          label="Összesített helyezés"
          value={formatRank(stats?.ranks.overall ?? null)}
          accent
        />
      </div>
    </section>
  );
}
