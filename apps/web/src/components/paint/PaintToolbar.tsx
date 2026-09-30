import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  Paintbrush,
  Eraser,
  Minus,
  Square,
  Circle,
  PaintBucket,
  Pipette,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";
import { Button } from "../ui/Button";
import type { PaintTool } from "./types";

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

const TOOL_ICONS: { id: PaintTool; label: string; Icon: LucideIcon }[] = [
  { id: "pencil", label: "Ceruza", Icon: Pencil },
  { id: "brush", label: "Ecset", Icon: Paintbrush },
  { id: "eraser", label: "Radír", Icon: Eraser },
  { id: "line", label: "Vonal", Icon: Minus },
  { id: "rect", label: "Téglalap", Icon: Square },
  { id: "ellipse", label: "Ellipszis", Icon: Circle },
  { id: "fill", label: "Kitöltés", Icon: PaintBucket },
  { id: "eyedropper", label: "Pipetta", Icon: Pipette },
];

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
      <div className="flex flex-wrap gap-1.5">
        {TOOL_ICONS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            label={<Icon size={18} strokeWidth={2} aria-hidden />}
            title={label}
            aria-label={label}
            variant={tool === id ? "primary" : "secondary"}
            active={tool === id}
            onClick={() => onToolChange(id)}
            className="!h-10 !min-w-10 !w-10 !px-0"
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
          label={<Undo2 size={18} aria-hidden />}
          title="Undo"
          aria-label="Undo"
          variant="ghost"
          onClick={onUndo}
          disabled={!canUndo}
          className="!h-10 !min-w-10 !w-10 !px-0"
        />
        <Button
          label={<Redo2 size={18} aria-hidden />}
          title="Redo"
          aria-label="Redo"
          variant="ghost"
          onClick={onRedo}
          disabled={!canRedo}
          className="!h-10 !min-w-10 !w-10 !px-0"
        />
        <Button
          label={<Trash2 size={18} aria-hidden />}
          title="Törlés"
          aria-label="Törlés"
          variant="ghost"
          onClick={onClear}
          className="!h-10 !min-w-10 !w-10 !px-0"
        />
      </div>
    </div>
  );
}
