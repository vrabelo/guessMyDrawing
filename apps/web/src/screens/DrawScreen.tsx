import { useEffect, useRef } from "react";
import { DRAW_TIME_LIMIT_MS, type UserStatsResponse } from "@tipp-my-draw/shared";
import { PaintCanvas } from "../components/paint/PaintCanvas";
import { MyDrawingsPanel } from "../components/draw/MyDrawingsPanel";
import { SaveDrawingModal } from "../components/draw/SaveDrawingModal";
import { formatDrawCountdown } from "../components/draw/DrawCountdown";
import { DrawToolbar } from "../components/draw/DrawToolbar";
import { DrawIntroModal } from "../components/draw/DrawIntroModal";
import { DrawStartModal } from "../components/draw/DrawStartModal";
import { useDrawSession } from "../components/draw/useDrawSession";
import { ModeToggle, type AppMode } from "../components/shell/ModeToggle";
import "../components/draw/draw-screen.css";

type DrawScreenProps = {
  onSaved: () => void;
  onModeChange: (mode: AppMode) => void;
  alias: string;
  stats: UserStatsResponse | null;
  onBindDiscard?: (discard: () => void) => void;
};

export function DrawScreen({
  onSaved,
  onModeChange,
  alias,
  stats,
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
  const themeDisplay = draw.selected?.published
    ? draw.meta.name.trim() || "…"
    : draw.themeLabel;

  const countdownLabel = draw.timeExpired
    ? "0:00"
    : draw.timerActive
      ? formatDrawCountdown(draw.remainingMs)
      : formatDrawCountdown(DRAW_TIME_LIMIT_MS);

  const countdownUrgent =
    draw.timerActive && (draw.remainingMs <= 15_000 || draw.timeExpired);

  const saveDisabled =
    draw.busy ||
    Boolean(draw.selected?.published) ||
    !(draw.timerActive || draw.mustSave);

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
            {themeDisplay}
          </p>
          <DrawToolbar
            themePick={draw.themePick}
            modeDisabled={
              Boolean(draw.selected?.published) || draw.busy || draw.mustSave
            }
            busy={draw.busy}
            mustSave={draw.mustSave}
            onNewDrawing={draw.startNew}
            onThemePickChange={draw.setThemePickAndRoll}
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
          <PaintCanvas
            ref={draw.paintRef}
            readOnly={draw.readOnly}
            countdownLabel={countdownLabel}
            countdownUrgent={countdownUrgent}
            onSave={draw.openSaveModal}
            saveDisabled={saveDisabled}
            overlay={
              <>
                <DrawStartModal
                  open={draw.showStartModal}
                  themeLabel={themeDisplay}
                  busy={draw.busy}
                  onNewTheme={draw.rerollTheme}
                  onStart={draw.startClock}
                />
                <SaveDrawingModal
                  open={draw.modalOpen}
                  scoped
                  initial={draw.meta}
                  guidedLock={
                    draw.promptLocked &&
                    !draw.selected?.published &&
                    !draw.selectedId
                  }
                  forceSave={draw.mustSave}
                  busy={draw.busy}
                  error={draw.error}
                  onCancel={draw.closeSaveModal}
                  onDiscard={draw.discardDrawing}
                  onConfirm={(m) => void draw.persist(m)}
                />
              </>
            }
          />
        </div>

        {draw.error && !draw.modalOpen ? (
          <p className="draw-screen__error">{draw.error}</p>
        ) : null}
      </div>

      <div className="draw-screen__side">
        <MyDrawingsPanel
          alias={alias}
          stats={stats}
          drawings={publishedOnly}
          selectedId={draw.selectedId}
          search={draw.search}
          onSearchChange={draw.setSearch}
          onSelect={(d) => void draw.loadDrawing(d)}
          loading={draw.loadingList}
        />
      </div>

      <DrawIntroModal
        open={draw.introOpen}
        onConfirm={(dontShowAgain) => draw.dismissIntro(dontShowAgain)}
      />
    </div>
  );
}
