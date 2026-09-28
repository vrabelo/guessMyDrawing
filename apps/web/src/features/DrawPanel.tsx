import { useCallback, useEffect, useRef, useState } from "react";
import type { OwnedDrawing, ThemeCategoryId } from "@tipp-my-draw/shared";
import {
  DRAW_TIME_LIMIT_MS,
  THEME_CATEGORY_BADGE_LABELS,
  THEME_CATEGORY_IDS,
  pickRandomFromCategory,
  pickRandomTheme,
} from "@tipp-my-draw/shared";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import {
  PaintCanvas,
  type PaintCanvasHandle,
} from "../components/paint/PaintCanvas";
import { MyDrawingsPanel } from "./draw/MyDrawingsPanel";
import {
  SaveDrawingModal,
  type SaveDrawingMeta,
} from "./draw/SaveDrawingModal";

type DrawPanelProps = {
  onSaved: () => void;
};

type DrawMode = "guided" | "free";

const emptyMeta = (): SaveDrawingMeta => ({
  theme: "",
  hint1: "",
  hint2: "",
  hint3: "",
  name: "",
});

function guidedMeta(category?: ThemeCategoryId): {
  meta: SaveDrawingMeta;
  category: ThemeCategoryId;
} {
  const entry = category
    ? pickRandomFromCategory(category)
    : pickRandomTheme();
  return {
    category: entry.category,
    meta: {
      theme: "",
      hint1: "",
      hint2: "",
      hint3: "",
      name: entry.word,
    },
  };
}

function formatDrawCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function DrawPanel({ onSaved }: DrawPanelProps) {
  const paintRef = useRef<PaintCanvasHandle>(null);
  const [mine, setMine] = useState<OwnedDrawing[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>("guided");
  const [promptLocked, setPromptLocked] = useState(true);
  const initialGuided = useRef(guidedMeta()).current;
  const [meta, setMeta] = useState<SaveDrawingMeta>(initialGuided.meta);
  const [activeCategory, setActiveCategory] = useState<ThemeCategoryId>(
    initialGuided.category
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [drawStartedAt, setDrawStartedAt] = useState<number | null>(() =>
    Date.now()
  );
  const [now, setNow] = useState(() => Date.now());
  const [timeExpired, setTimeExpired] = useState(false);
  const forcedModalOpened = useRef(false);

  const selected = mine.find((d) => d.id === selectedId) ?? null;
  const readOnly = Boolean(selected?.published) || timeExpired;
  const timerActive = drawStartedAt != null && !selected?.published;
  const remainingMs = timerActive
    ? Math.max(0, DRAW_TIME_LIMIT_MS - (now - drawStartedAt))
    : 0;
  const showRecommendBar =
    drawMode === "guided" && !selected?.published && !selectedId;
  const mustSave = timeExpired && !selected?.published;

  const refreshMine = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await api.myDrawings();
      setMine(list);
    } catch {
      setMine([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void refreshMine();
  }, [refreshMine]);

  useEffect(() => {
    if (!timerActive || timeExpired) return;
    const tick = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(tick);
  }, [timerActive, timeExpired, drawStartedAt]);

  useEffect(() => {
    if (!timerActive || timeExpired) return;
    if (remainingMs > 0) return;
    setTimeExpired(true);
    if (!forcedModalOpened.current) {
      forcedModalOpened.current = true;
      setError("");
      setModalOpen(true);
    }
  }, [timerActive, timeExpired, remainingMs]);

  function applyGuidedPrompt(category?: ThemeCategoryId) {
    if (mustSave) return;
    const next = guidedMeta(category);
    setMeta(next.meta);
    setActiveCategory(next.category);
    setPromptLocked(true);
    setStatusMsg("");
  }

  function startNew(mode: DrawMode = drawMode) {
    if (mustSave) return;
    setSelectedId(null);
    setError("");
    setDrawMode(mode);
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(Date.now());
    setNow(Date.now());
    if (mode === "guided") {
      const next = guidedMeta();
      setMeta(next.meta);
      setActiveCategory(next.category);
      setPromptLocked(true);
      setStatusMsg("");
    } else {
      setPromptLocked(false);
      setMeta(emptyMeta());
      setStatusMsg("Szabad rajz — bármit megrajzolhatsz.");
    }
    paintRef.current?.clear();
  }

  function switchMode(mode: DrawMode) {
    if (readOnly || busy || mustSave) return;
    if (selectedId) {
      setDrawMode(mode);
      return;
    }
    startNew(mode);
  }

  async function loadDrawing(drawing: OwnedDrawing) {
    if (mustSave) return;
    setSelectedId(drawing.id);
    setDrawMode("free");
    setPromptLocked(false);
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(null);
    setMeta({
      theme: drawing.theme,
      hint1: drawing.hint1,
      hint2: drawing.hint2,
      hint3: drawing.hint3,
      name: drawing.name,
    });
    setError("");
    setStatusMsg(
      drawing.published
        ? "Publikált rajz — csak megtekintés, szerkesztés nem engedélyezett."
        : "Vázlat betöltve — szerkeszthető."
    );
    try {
      await paintRef.current?.loadFromDataURL(drawing.imageDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Betöltés sikertelen.");
    }
  }

  async function persist(nextMeta: SaveDrawingMeta, published: boolean) {
    setBusy(true);
    setError("");
    const imageDataUrl = paintRef.current?.toDataURL() ?? "";
    const body = { ...nextMeta, imageDataUrl, published };
    try {
      const saved =
        selectedId && !selected?.published
          ? await api.updateDrawing(selectedId, body)
          : await api.createDrawing(body);
      setMeta(nextMeta);
      setSelectedId(saved.id);
      setModalOpen(false);
      setTimeExpired(false);
      forcedModalOpened.current = false;
      setDrawStartedAt(null);
      setStatusMsg(
        saved.published
          ? "Publikálva — a rajz zárolva, Játszom módban elérhető."
          : "Vázlat mentve."
      );
      await refreshMine();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mentés sikertelen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="draw-workspace col-span-full grid min-h-0 min-w-0 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="draw-mode-toggle" role="tablist" aria-label="Rajz mód">
              <button
                type="button"
                role="tab"
                aria-selected={drawMode === "guided"}
                className={[
                  "draw-mode-toggle__btn",
                  drawMode === "guided" ? "draw-mode-toggle__btn--active" : "",
                ].join(" ")}
                disabled={readOnly || busy || mustSave}
                onClick={() => switchMode("guided")}
              >
                Ajánlott
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={drawMode === "free"}
                className={[
                  "draw-mode-toggle__btn",
                  drawMode === "free" ? "draw-mode-toggle__btn--active" : "",
                ].join(" ")}
                disabled={readOnly || busy || mustSave}
                onClick={() => switchMode("free")}
              >
                Szabad rajz
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {promptLocked && !selected?.published && !selectedId && !mustSave ? (
              <Button
                label="Új szó"
                variant="ghost"
                onClick={() => applyGuidedPrompt()}
                disabled={busy || readOnly}
              />
            ) : null}
            <Button
              label="Új rajz"
              variant="ghost"
              onClick={() => startNew()}
              disabled={busy || mustSave}
            />
            <Button
              label="Mentés"
              variant="primary"
              onClick={() => {
                setError("");
                setModalOpen(true);
              }}
              disabled={busy || Boolean(selected?.published)}
            />
          </div>
        </div>

        {/* Spacer: keeps former status-row height so layout stays stable */}
        <p
          className="draw-status-spacer mb-2 truncate px-0.5 text-sm text-[var(--muted)]"
          aria-live="polite"
        >
          {mustSave
            ? "Idő lejárt — mentsd el a rajzot."
            : showRecommendBar
              ? "\u00a0"
              : statusMsg ||
                (selected?.published ? "\u00a0" : "Rajzolj, majd mentsd el.")}
        </p>

        {showRecommendBar ? (
          <div className="draw-recommend-bar mb-2" role="region" aria-label="Ajánlott téma">
            <p className="draw-recommend-bar__title">
              Ajánlott téma: &ldquo;{meta.name}&rdquo;
            </p>
            <div className="draw-recommend-bar__badges" role="group" aria-label="Kategóriák">
              {THEME_CATEGORY_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={[
                    "draw-recommend-badge",
                    activeCategory === id ? "draw-recommend-badge--active" : "",
                  ].join(" ")}
                  disabled={busy || mustSave}
                  onClick={() => applyGuidedPrompt(id)}
                >
                  {THEME_CATEGORY_BADGE_LABELS[id]}
                </button>
              ))}
            </div>
          </div>
        ) : selected?.published ? (
          <p className="mb-2 rounded-xl border border-[var(--border)] bg-white/[0.03] px-3 py-2 text-xs text-[var(--muted-strong)]">
            Ez a rajz publikálva van — a vászon és az adatok zárolva.
          </p>
        ) : null}

        <div className="canvas-stage canvas-stage--landscape draw-stage draw-stage--fill relative min-h-0 flex-1 p-2">
          {timerActive ? (
            <p
              className={[
                "draw-countdown-overlay",
                remainingMs <= 15_000 || timeExpired
                  ? "draw-countdown-overlay--urgent"
                  : "",
              ].join(" ")}
              aria-live="polite"
            >
              {timeExpired ? "0:00" : formatDrawCountdown(remainingMs)}
            </p>
          ) : null}
          <PaintCanvas ref={paintRef} readOnly={readOnly} />
        </div>

        {error && !modalOpen ? (
          <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
        ) : null}
      </div>

      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <MyDrawingsPanel
          drawings={mine}
          selectedId={selectedId}
          search={search}
          onSearchChange={setSearch}
          onSelect={(d) => void loadDrawing(d)}
          onNew={() => startNew()}
          loading={loadingList}
        />
      </div>

      <SaveDrawingModal
        open={modalOpen}
        initial={meta}
        guidedLock={promptLocked && !selected?.published && !selectedId}
        forceSave={mustSave}
        busy={busy}
        error={error}
        onCancel={() => {
          if (!busy && !mustSave) {
            setModalOpen(false);
            setError("");
          }
        }}
        onConfirm={(m, published) => void persist(m, published)}
      />
    </div>
  );
}
