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

function guidedMetaForPick(pick: ThemePick): {
  meta: SaveDrawingMeta;
  category: ThemeCategoryId;
} {
  return pick === "auto" ? guidedMeta() : guidedMeta(pick);
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
  const initialGuided = useRef(guidedMetaForPick("auto")).current;
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
  const showStartClock =
    !introOpen &&
    !selected?.published &&
    drawStartedAt == null &&
    !mustSave;

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

  function setThemePickAndRoll(pick: ThemePick) {
    if (mustSave || busy) return;
    setThemePick(pick);
    setDrawMode("guided");
    const next = guidedMetaForPick(pick);
    setMeta(next.meta);
    setActiveCategory(next.category);
    setPromptLocked(true);
  }

  function resetToNewDrawing(mode: DrawMode = drawMode) {
    setSelectedId(null);
    setError("");
    setDrawMode(mode);
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(null);
    setNow(Date.now());
    setModalOpen(false);
    if (mode === "guided") {
      const next = guidedMetaForPick(themePick);
      setMeta(next.meta);
      setActiveCategory(next.category);
      setPromptLocked(true);
    } else {
      setPromptLocked(false);
      setMeta(emptyMeta());
    }
    paintRef.current?.clear();
  }

  function startNew(mode: DrawMode = drawMode) {
    if (mustSave) return;
    resetToNewDrawing(mode);
  }

  function startFreeMode() {
    if (selected?.published || busy || mustSave) return;
    if (selectedId) {
      setDrawMode("free");
      return;
    }
    if (drawStartedAt != null && !timeExpired) return;
    resetToNewDrawing("free");
  }

  function startClock() {
    if (selected?.published || mustSave || busy) return;
    if (drawStartedAt != null) return;
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(Date.now());
    setNow(Date.now());
  }

  function dismissIntro(dontShowAgain = false) {
    if (dontShowAgain) persistHideDrawIntro();
    setIntroOpen(false);
  }

  function switchMode(mode: DrawMode) {
    if (selected?.published || busy || mustSave) return;
    if (selectedId) {
      setDrawMode(mode);
      return;
    }
    if (drawStartedAt != null && !timeExpired) return;
    resetToNewDrawing(mode);
  }

  async function loadDrawing(drawing: OwnedDrawing) {
    if (mustSave) return;
    setSelectedId(drawing.id);
    setDrawMode("free");
    setPromptLocked(false);
    setTimeExpired(false);
    forcedModalOpened.current = false;
    setDrawStartedAt(null);
    setIntroOpen(false);
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
    resetToNewDrawing(drawMode);
  }

  function openSaveModal() {
    setError("");
    setModalOpen(true);
  }

  function closeSaveModal() {
    if (!busy && !mustSave) {
      setModalOpen(false);
      setError("");
    }
  }

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
    showStartClock,
    setThemePickAndRoll,
    startNew,
    startFreeMode,
    startClock,
    dismissIntro,
    switchMode,
    loadDrawing,
    persist,
    discardDrawing,
    openSaveModal,
    closeSaveModal,
  };
}
