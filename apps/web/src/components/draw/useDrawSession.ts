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

export function useDrawSession(onSaved: () => void) {
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
    promptLocked,
    meta,
    activeCategory,
    modalOpen,
    busy,
    error,
    statusMsg,
    timeExpired,
    readOnly,
    timerActive,
    remainingMs,
    showRecommendBar,
    mustSave,
    applyGuidedPrompt,
    startNew,
    switchMode,
    loadDrawing,
    persist,
    openSaveModal,
    closeSaveModal,
  };
}
