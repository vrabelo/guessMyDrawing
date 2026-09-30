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
  disabled?: boolean;
  countdownLabel: string;
  countdownUrgent?: boolean;
  onSave: () => void;
  saveDisabled?: boolean;
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

const ICON_BTN = "!h-12 !min-w-12 !w-12 !px-0 shrink-0";

export function PaintToolbar({
  tool,
  color,
  lineWidth,
  fillShape,
  canUndo,
  canRedo,
  disabled = false,
  countdownLabel,
  countdownUrgent = false,
  onSave,
  saveDisabled = false,
  onToolChange,
  onColorChange,
  onLineWidthChange,
  onFillShapeChange,
  onUndo,
  onRedo,
  onClear,
}: PaintToolbarProps) {
  return (
    <div className="paint-toolbar">
      <div className="paint-toolbar__row paint-toolbar__row--tools">
        <div className="paint-toolbar__tools">
          {TOOL_ICONS.map(({ id, label, Icon }) => (
            <Button
              key={id}
              label={<Icon size={24} strokeWidth={2} aria-hidden />}
              title={label}
              aria-label={label}
              variant={tool === id ? "primary" : "secondary"}
              active={tool === id}
              disabled={disabled}
              onClick={() => onToolChange(id)}
              className={ICON_BTN}
            />
          ))}
        </div>
        <p
          className={[
            "draw-countdown-overlay paint-toolbar__countdown",
            countdownUrgent ? "draw-countdown-overlay--urgent" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          {countdownLabel}
        </p>
      </div>

      <div className="paint-toolbar__row paint-toolbar__row--opts">
        <label className="paint-toolbar__label">
          Szín
          <input
            type="color"
            value={color}
            disabled={disabled}
            onChange={(e) => onColorChange(e.target.value)}
            className="paint-toolbar__color"
          />
        </label>
        <label className="paint-toolbar__label paint-toolbar__label--grow">
          Vastagság
          <input
            type="range"
            min={1}
            max={40}
            value={lineWidth}
            disabled={disabled}
            onChange={(e) => onLineWidthChange(Number(e.target.value))}
            className="paint-toolbar__range"
          />
          <span className="paint-toolbar__width">{lineWidth}</span>
        </label>
        {(tool === "rect" || tool === "ellipse") && (
          <label className="paint-toolbar__label">
            <input
              type="checkbox"
              checked={fillShape}
              disabled={disabled}
              onChange={(e) => onFillShapeChange(e.target.checked)}
              className="h-4 w-4"
            />
            Kitöltött alakzat
          </label>
        )}
        <div className="paint-toolbar__history">
          <Button
            label={<Undo2 size={24} aria-hidden />}
            title="Undo"
            aria-label="Undo"
            variant="ghost"
            onClick={onUndo}
            disabled={disabled || !canUndo}
            className={ICON_BTN}
          />
          <Button
            label={<Redo2 size={24} aria-hidden />}
            title="Redo"
            aria-label="Redo"
            variant="ghost"
            onClick={onRedo}
            disabled={disabled || !canRedo}
            className={ICON_BTN}
          />
          <Button
            label={<Trash2 size={24} aria-hidden />}
            title="Törlés"
            aria-label="Törlés"
            variant="ghost"
            onClick={onClear}
            disabled={disabled}
            className={ICON_BTN}
          />
        </div>
      </div>

      <div className="paint-toolbar__row paint-toolbar__row--save">
        <button
          type="button"
          className="paint-toolbar__save"
          onClick={onSave}
          disabled={saveDisabled}
        >
          Mentés
        </button>
      </div>
    </div>
  );
}
