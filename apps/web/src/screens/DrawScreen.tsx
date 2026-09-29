import { useEffect, useRef } from "react";
import { PaintCanvas } from "../components/paint/PaintCanvas";
import { MyDrawingsPanel } from "../components/draw/MyDrawingsPanel";
import { SaveDrawingModal } from "../components/draw/SaveDrawingModal";
import {
  DrawCountdown,
  formatDrawCountdown,
} from "../components/draw/DrawCountdown";
import { DrawToolbar } from "../components/draw/DrawToolbar";
import { DrawIntroModal } from "../components/draw/DrawIntroModal";
import { DrawStartModal } from "../components/draw/DrawStartModal";
import { useDrawSession } from "../components/draw/useDrawSession";
import { ModeToggle, type AppMode } from "../components/shell/ModeToggle";
import "../components/draw/draw-screen.css";

type DrawScreenProps = {
  onSaved: () => void;
  onModeChange: (mode: AppMode) => void;
  onBindDiscard?: (discard: () => void) => void;
};

export function DrawScreen({
  onSaved,
  onModeChange,
  onBindDiscard,
}: DrawScreenProps) {
  const draw = useDrawSession(onSaved);
  const discardRef = useRef(draw.discardAttempt);
  discardRef.current = draw.discardAttempt;

  useEffect(() => {
    onBindDiscard?.(() => discardRef.current());
    return () => onBindDiscard?.(() => {});
  }, [onBindDiscard]);

  const statusText = draw.mustSave
    ? "Idő lejárt — publikáld vagy dobd el a rajzot."
    : "";

  const publishedOnly = draw.mine.filter((d) => d.published);

  return (
    <div className="draw-workspace draw-screen">
      <div className="draw-screen__main">
        <div className="draw-screen__toolbar">
          <ModeToggle
            mode="draw"
            onChange={(mode) => {
              draw.discardAttempt();
              onModeChange(mode);
            }}
          />
          <p className="draw-screen__theme-center" aria-live="polite">
            {draw.selected?.published
              ? draw.meta.name.trim() || "…"
              : draw.themeLabel}
          </p>
          <DrawToolbar
            themePick={draw.themePick}
            modeDisabled={
              Boolean(draw.selected?.published) || draw.busy || draw.mustSave
            }
            busy={draw.busy}
            mustSave={draw.mustSave}
            published={Boolean(draw.selected?.published)}
            canSave={
              (draw.timerActive || draw.mustSave) && !draw.selected?.published
            }
            onNewDrawing={draw.startNew}
            onThemePickChange={draw.setThemePickAndRoll}
            onSave={draw.openSaveModal}
          />
        </div>

        {statusText ? (
          <p
            className="draw-status-spacer draw-screen__status"
            aria-live="polite"
          >
            {statusText}
          </p>
        ) : null}

        {draw.selected?.published ? (
          <p className="draw-screen__locked-note">
            Ez a rajz publikálva van — a vászon és az adatok zárolva.
          </p>
        ) : null}

        <div className="canvas-stage canvas-stage--landscape draw-stage draw-stage--fill draw-screen__canvas">
          {draw.timerActive ? (
            <DrawCountdown
              label={
                draw.timeExpired
                  ? "0:00"
                  : formatDrawCountdown(draw.remainingMs)
              }
              urgent={draw.remainingMs <= 15_000 || draw.timeExpired}
            />
          ) : null}
          <PaintCanvas ref={draw.paintRef} readOnly={draw.readOnly} />
        </div>

        {draw.error && !draw.modalOpen ? (
          <p className="draw-screen__error">{draw.error}</p>
        ) : null}
      </div>

      <div className="draw-screen__side">
        <MyDrawingsPanel
          drawings={publishedOnly}
          selectedId={draw.selectedId}
          search={draw.search}
          onSearchChange={draw.setSearch}
          onSelect={(d) => void draw.loadDrawing(d)}
          onNew={draw.startNew}
          loading={draw.loadingList}
        />
      </div>

      <DrawIntroModal
        open={draw.introOpen}
        onConfirm={(dontShowAgain) => draw.dismissIntro(dontShowAgain)}
      />

      <DrawStartModal
        open={draw.showStartModal}
        busy={draw.busy}
        onStart={draw.startClock}
      />

      <SaveDrawingModal
        open={draw.modalOpen}
        initial={draw.meta}
        guidedLock={
          draw.promptLocked && !draw.selected?.published && !draw.selectedId
        }
        forceSave={draw.mustSave}
        busy={draw.busy}
        error={draw.error}
        onCancel={draw.closeSaveModal}
        onDiscard={draw.discardDrawing}
        onConfirm={(m) => void draw.persist(m)}
      />
    </div>
  );
}
