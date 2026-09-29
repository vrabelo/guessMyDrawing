import { Button } from "../components/ui/Button";
import { PaintCanvas } from "../components/paint/PaintCanvas";
import { MyDrawingsPanel } from "../components/draw/MyDrawingsPanel";
import { SaveDrawingModal } from "../components/draw/SaveDrawingModal";
import {
  DrawCountdown,
  formatDrawCountdown,
} from "../components/draw/DrawCountdown";
import { DrawToolbar } from "../components/draw/DrawToolbar";
import { DrawIntroModal } from "../components/draw/DrawIntroModal";
import { useDrawSession } from "../components/draw/useDrawSession";
import { ModeToggle, type AppMode } from "../components/shell/ModeToggle";
import "../components/draw/draw-screen.css";

type DrawScreenProps = {
  onSaved: () => void;
  onModeChange: (mode: AppMode) => void;
};

export function DrawScreen({ onSaved, onModeChange }: DrawScreenProps) {
  const draw = useDrawSession(onSaved);

  const statusText = draw.mustSave
    ? "Idő lejárt — mentsd el vagy dobd el a rajzot."
    : "";

  const themeLabel = draw.meta.name.trim() || "…";

  return (
    <div className="draw-workspace draw-screen">
      <div className="draw-screen__main">
        <div className="draw-screen__toolbar">
          <ModeToggle mode="draw" onChange={onModeChange} />
          <DrawToolbar
            drawMode={draw.drawMode}
            themePick={draw.themePick}
            modeDisabled={
              Boolean(draw.selected?.published) ||
              draw.busy ||
              draw.mustSave ||
              draw.timerActive
            }
            busy={draw.busy}
            mustSave={draw.mustSave}
            published={Boolean(draw.selected?.published)}
            onNewDrawing={() => draw.startNew("guided")}
            onThemePickChange={draw.setThemePickAndRoll}
            onFreeMode={draw.startFreeMode}
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

        {draw.showStartClock ? (
          <div className="draw-screen__start-clock">
            <p className="draw-screen__theme-prompt">
              Rajzold le ezt: &ldquo;{themeLabel}&rdquo;
            </p>
            <Button
              label="Óra indítása"
              variant="primary"
              onClick={draw.startClock}
              disabled={draw.busy}
            />
          </div>
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
          drawings={draw.mine}
          selectedId={draw.selectedId}
          search={draw.search}
          onSearchChange={draw.setSearch}
          onSelect={(d) => void draw.loadDrawing(d)}
          onNew={() => draw.startNew("guided")}
          loading={draw.loadingList}
        />
      </div>

      <DrawIntroModal
        open={draw.introOpen}
        onConfirm={(dontShowAgain) => draw.dismissIntro(dontShowAgain)}
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
        onConfirm={(m, published) => void draw.persist(m, published)}
      />
    </div>
  );
}
