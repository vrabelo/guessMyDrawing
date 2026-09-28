import { PaintCanvas } from "../components/paint/PaintCanvas";
import { MyDrawingsPanel } from "../components/draw/MyDrawingsPanel";
import { SaveDrawingModal } from "../components/draw/SaveDrawingModal";
import { DrawModeToggle } from "../components/draw/DrawModeToggle";
import { DrawRecommendBar } from "../components/draw/DrawRecommendBar";
import {
  DrawCountdown,
  formatDrawCountdown,
} from "../components/draw/DrawCountdown";
import { DrawToolbarActions } from "../components/draw/DrawToolbarActions";
import { useDrawSession } from "../components/draw/useDrawSession";
import "../components/draw/draw-screen.css";

type DrawScreenProps = {
  onSaved: () => void;
};

export function DrawScreen({ onSaved }: DrawScreenProps) {
  const draw = useDrawSession(onSaved);

  const statusText = draw.mustSave
    ? "Idő lejárt — mentsd el a rajzot."
    : draw.showRecommendBar
      ? "\u00a0"
      : draw.statusMsg ||
        (draw.selected?.published ? "\u00a0" : "Rajzolj, majd mentsd el.");

  return (
    <div className="draw-workspace draw-screen">
      <div className="draw-screen__main">
        <div className="draw-screen__toolbar">
          <DrawModeToggle
            mode={draw.drawMode}
            disabled={draw.readOnly || draw.busy || draw.mustSave}
            onChange={draw.switchMode}
          />
          <DrawToolbarActions
            showNewWord={
              draw.promptLocked &&
              !draw.selected?.published &&
              !draw.selectedId &&
              !draw.mustSave
            }
            busy={draw.busy}
            readOnly={draw.readOnly}
            mustSave={draw.mustSave}
            published={Boolean(draw.selected?.published)}
            onNewWord={() => draw.applyGuidedPrompt()}
            onNewDrawing={() => draw.startNew()}
            onSave={draw.openSaveModal}
          />
        </div>

        <p className="draw-status-spacer draw-screen__status" aria-live="polite">
          {statusText}
        </p>

        {draw.showRecommendBar ? (
          <div className="draw-screen__recommend">
            <DrawRecommendBar
              themeName={draw.meta.name}
              activeCategory={draw.activeCategory}
              disabled={draw.busy || draw.mustSave}
              onSelectCategory={(id) => draw.applyGuidedPrompt(id)}
            />
          </div>
        ) : draw.selected?.published ? (
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
          drawings={draw.mine}
          selectedId={draw.selectedId}
          search={draw.search}
          onSearchChange={draw.setSearch}
          onSelect={(d) => void draw.loadDrawing(d)}
          onNew={() => draw.startNew()}
          loading={draw.loadingList}
        />
      </div>

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
        onConfirm={(m, published) => void draw.persist(m, published)}
      />
    </div>
  );
}
