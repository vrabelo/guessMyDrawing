import { Button } from "../ui/Button";
import { PAINT_TOOLS, type PaintTool } from "./types";

type PaintToolbarProps = {
  tool: PaintTool;
  color: string;
  lineWidth: number;
  fillShape: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: PaintTool) => void;
  onColorChange: (color: string) => void;
  onLineWidthChange: (width: number) => void;
  onFillShapeChange: (fill: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
};

export function PaintToolbar({
  tool,
  color,
  lineWidth,
  fillShape,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onFillShapeChange,
  onUndo,
  onRedo,
  onClear,
}: PaintToolbarProps) {
  return (
    <div className="mb-2 flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {PAINT_TOOLS.map((t) => (
          <Button
            key={t.id}
            label={t.label}
            variant={tool === t.id ? "primary" : "secondary"}
            active={tool === t.id}
            onClick={() => onToolChange(t.id)}
            className="!px-2 !py-1 text-xs"
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-[var(--muted)]">
        <label className="flex items-center gap-2 text-sm">
          Szín
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Vastagság
          <input
            type="range"
            min={1}
            max={40}
            value={lineWidth}
            onChange={(e) => onLineWidthChange(Number(e.target.value))}
          />
          <span className="tabular-nums text-xs">{lineWidth}</span>
        </label>
        {(tool === "rect" || tool === "ellipse") && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={fillShape}
              onChange={(e) => onFillShapeChange(e.target.checked)}
            />
            Kitöltött alakzat
          </label>
        )}
        <Button
          label="Undo"
          variant="ghost"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <Button
          label="Redo"
          variant="ghost"
          onClick={onRedo}
          disabled={!canRedo}
        />
        <Button label="Törlés" variant="ghost" onClick={onClear} />
      </div>
    </div>
  );
}
