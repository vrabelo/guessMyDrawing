import { useCallback, useEffect, useRef, useState } from "react";
import type { OwnedDrawing, ThemeCategoryId } from "@tipp-my-draw/shared";
import {
  DRAW_TIME_LIMIT_MS,
  pickRandomFromCategory,
  pickRandomTheme,
} from "@tipp-my-draw/shared";
import { api } from "../../api/client";
import type { PaintCanvasHandle } from "../paint/PaintCanvas";
import type { SaveDrawingMeta } from "./SaveDrawingModal";
import type { DrawMode } from "./DrawModeToggle";
import type { ThemePick } from "./DrawToolbar";

const DRAW_INTRO_HIDE_KEY = "tipp-my-draw-hide-draw-intro";

function shouldShowDrawIntro(): boolean {
  try {
    return localStorage.getItem(DRAW_INTRO_HIDE_KEY) !== "1";
  } catch {
    return true;
  }
}

function persistHideDrawIntro(): void {
  try {
    localStorage.setItem(DRAW_INTRO_HIDE_KEY, "1");
  } catch {
    /* ignore */
  }
}

const emptyMeta = (): SaveDrawingMeta => ({
  theme: "",
  hint1: "",
  hint2: "",
  hint3: "",
  name: "",
});

function usedThemeNames(drawings: OwnedDrawing[]): Set<string> {
  return new Set(
    drawings
      .filter((d) => d.published)
      .map((d) => d.name.trim().toLowerCase())
      .filter(Boolean)
  );
}

function guidedMeta(
  category?: ThemeCategoryId,
  exclude?: ReadonlySet<string>
): {
  meta: SaveDrawingMeta;
  category: ThemeCategoryId;
} | null {
  const entry = category
    ? pickRandomFromCategory(category, exclude)
    : pickRandomTheme(undefined, exclude);
  if (!entry) return null;
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

export function useDrawSession(onSaved: () => void) {
  const paintRef = useRef<PaintCanvasHandle>(null);
  const [mine, setMine] = useState<OwnedDrawing[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>("guided");
  const [themePick, setThemePick] = useState<ThemePick>("auto");
  const [promptLocked, setPromptLocked] = useState(true);
  const initialGuided = useRef(guidedMeta() ?? {
    category: "allatok" as ThemeCategoryId,
    meta: emptyMeta(),
  }).current;
  const [meta, setMeta] = useState<SaveDrawingMeta>(initialGuided.meta);
  const [activeCategory, setActiveCategory] = useState<ThemeCategoryId>(
    initialGuided.category
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(() => shouldShowDrawIntro());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [drawStartedAt, setDrawStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [timeExpired, setTimeExpired] = useState(false);
  const forcedModalOpened = useRef(false);

  const selected = mine.find((d) => d.id === selectedId) ?? null;
  const clockRunning = drawStartedAt != null && !selected?.published;
  const readOnly =
    Boolean(selected?.published) || timeExpired || !clockRunning;
  const timerActive = clockRunning;
  const remainingMs = timerActive
    ? Math.max(0, DRAW_TIME_LIMIT_MS - (now - drawStartedAt))
    : 0;
  const mustSave = timeExpired && !selected?.published;
  const showStartModal =
    !introOpen &&
    !selected?.published &&
    !selectedId &&
    drawStartedAt == null &&
    !mustSave &&
    !modalOpen;

  /** In-progress attempt that leave/navigation should wipe. */
  const attemptActive =
    !selected?.published &&
    (drawStartedAt != null || mustSave || showStartModal);

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

  function applyThemePick(pick: ThemePick) {
    setThemePick(pick);
    if (pick === "free") {
      setDrawMode("free");
      setPromptLocked(false);
      setMeta(emptyMeta());
      setError("");
      return;
    }
    setDrawMode("guided");
    const exclude = usedThemeNames(mine);
    const next =
      pick === "auto"
        ? guidedMeta(undefined, exclude)
        : guidedMeta(pick, exclude);
    if (!next) {
      setError("Nincs több elérhető téma. Válassz más kategóriát vagy szabad rajzot.");
      return;
    }
    setMeta(next.meta);
    setActiveCategory(next.category);
    setPromptLocked(true);
    setError("");
  }

  function resetToNewDrawing(pick: ThemePick = themePick) {
    setSelectedId(null);
    setError("");
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(null);
    setNow(Date.now());
    setModalOpen(false);
    applyThemePick(pick);
    paintRef.current?.clear();
  }

  function setThemePickAndRoll(pick: ThemePick) {
    if (mustSave || busy) return;
    resetToNewDrawing(pick);
  }

  function startNew() {
    if (mustSave || busy) return;
    resetToNewDrawing(themePick);
  }

  function startClock() {
    if (selected?.published || mustSave || busy) return;
    if (drawStartedAt != null) return;
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(Date.now());
    setNow(Date.now());
  }

  /** Re-roll prompt while start modal is open (does not start the clock). */
  function rerollTheme() {
    if (selected?.published || mustSave || busy) return;
    if (drawStartedAt != null) return;
    applyThemePick(themePick);
  }

  function dismissIntro(dontShowAgain = false) {
    if (dontShowAgain) persistHideDrawIntro();
    setIntroOpen(false);
  }

  async function loadDrawing(drawing: OwnedDrawing) {
    if (mustSave) return;
    // Unpublished drafts cannot be continued.
    if (!drawing.published) return;
    setSelectedId(drawing.id);
    setDrawMode("free");
    setPromptLocked(false);
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(null);
    setIntroOpen(false);
    setModalOpen(false);
    setMeta({
      theme: drawing.theme,
      hint1: drawing.hint1,
      hint2: drawing.hint2,
      hint3: drawing.hint3,
      name: drawing.name,
    });
    setError("");
    try {
      await paintRef.current?.loadFromDataURL(drawing.imageDataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Betöltés sikertelen.");
    }
  }

  async function persist(nextMeta: SaveDrawingMeta) {
    setBusy(true);
    setError("");
    const imageDataUrl = paintRef.current?.toDataURL() ?? "";
    const body = { ...nextMeta, imageDataUrl, published: true };
    try {
      const saved = await api.createDrawing(body);
      setMeta(nextMeta);
      setSelectedId(saved.id);
      setModalOpen(false);
      setTimeExpired(false);
      forcedModalOpened.current = false;
      setDrawStartedAt(null);
      await refreshMine();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mentés sikertelen.");
    } finally {
      setBusy(false);
    }
  }

  function discardDrawing() {
    if (busy) return;
    resetToNewDrawing(themePick);
  }

  /** Wipe in-progress attempt when leaving draw (home / Kitalálom / unmount). */
  function discardAttempt() {
    setBusy(false);
    resetToNewDrawing(themePick);
  }

  function openSaveModal() {
    if (selected?.published) return;
    setError("");
    setModalOpen(true);
  }

  function closeSaveModal() {
    if (!busy && !mustSave) {
      setModalOpen(false);
      setError("");
    }
  }

  const themeLabel =
    drawMode === "free" ? "Szabad rajz" : meta.name.trim() || "…";

  return {
    paintRef,
    mine,
    loadingList,
    search,
    setSearch,
    selectedId,
    selected,
    drawMode,
    themePick,
    promptLocked,
    meta,
    activeCategory,
    modalOpen,
    introOpen,
    busy,
    error,
    timeExpired,
    readOnly,
    timerActive,
    remainingMs,
    mustSave,
    showStartModal,
    attemptActive,
    themeLabel,
    setThemePickAndRoll,
    startNew,
    startClock,
    rerollTheme,
    dismissIntro,
    loadDrawing,
    persist,
    discardDrawing,
    discardAttempt,
    openSaveModal,
    closeSaveModal,
  };
}
