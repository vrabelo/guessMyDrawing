import { Lock, Pencil } from "lucide-react";
import type { OwnedDrawing } from "@tipp-my-draw/shared";

type MyDrawingsPanelProps = {
  drawings: OwnedDrawing[];
  selectedId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (drawing: OwnedDrawing) => void;
  onNew: () => void;
  loading?: boolean;
};

export function MyDrawingsPanel({
  drawings,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onNew,
  loading = false,
}: MyDrawingsPanelProps) {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? drawings.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.theme.toLowerCase().includes(q)
      )
    : drawings;

  return (
    <aside className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden">
      <div className="game-card flex shrink-0 flex-col gap-3 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="game-card-title mb-0">Saját rajzaim</h2>
          <button
            type="button"
            onClick={onNew}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--border-hover)]"
          >
            Új rajz
          </button>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Keresés név vagy téma…"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-2 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      <div className="game-card min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <p className="px-2 py-3 text-sm text-[var(--muted)]">Betöltés…</p>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-3 text-sm text-[var(--muted)]">
            Nincs találat.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {filtered.map((d) => {
              const selected = d.id === selectedId;
              return (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(d)}
                    className={[
                      "flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition",
                      selected
                        ? "bg-[var(--accent-muted)] ring-1 ring-[var(--accent)]"
                        : "hover:bg-white/[0.04]",
                    ].join(" ")}
                  >
                    <span className="mt-0.5 text-[var(--muted)]">
                      {d.published ? (
                        <Lock size={14} strokeWidth={2.25} aria-hidden />
                      ) : (
                        <Pencil size={14} strokeWidth={2.25} aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                        {d.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--muted)]">
                        <span
                          className={
                            d.published
                              ? "shrink-0 text-[var(--accent)]"
                              : "shrink-0 text-amber-300/90"
                          }
                        >
                          {d.published ? "Publikált" : "Vázlat"}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
