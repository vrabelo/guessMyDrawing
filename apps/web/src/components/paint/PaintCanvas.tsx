import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PaintToolbar } from "./PaintToolbar";
import type { PaintTool } from "./types";

const W = 480;
const H = 320;
const MAX_HISTORY = 40;

export type PaintCanvasHandle = {
  toDataURL: () => string;
  clear: () => void;
};

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function colorsMatch(
  data: Uint8ClampedArray,
  i: number,
  target: [number, number, number, number],
  tol = 8
): boolean {
  return (
    Math.abs(data[i] - target[0]) <= tol &&
    Math.abs(data[i + 1] - target[1]) <= tol &&
    Math.abs(data[i + 2] - target[2]) <= tol &&
    Math.abs(data[i + 3] - target[3]) <= tol
  );
}

function floodFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillHex: string
) {
  const img = ctx.getImageData(0, 0, W, H);
  const { data } = img;
  const sx = Math.floor(x);
  const sy = Math.floor(y);
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;

  const startIdx = (sy * W + sx) * 4;
  const target: [number, number, number, number] = [
    data[startIdx],
    data[startIdx + 1],
    data[startIdx + 2],
    data[startIdx + 3],
  ];
  const fill = hexToRgba(fillHex);
  if (colorsMatch(data, startIdx, fill, 0)) return;

  const stack: [number, number][] = [[sx, sy]];
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    const i = (cy * W + cx) * 4;
    if (!colorsMatch(data, i, target)) continue;
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < W - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < H - 1) stack.push([cx, cy + 1]);
  }
  ctx.putImageData(img, 0, 0);
}

export const PaintCanvas = forwardRef<PaintCanvasHandle>(function PaintCanvas(
  _props,
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const snapshotRef = useRef<ImageData | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);

  const [tool, setTool] = useState<PaintTool>("pencil");
  const [color, setColor] = useState("#1c1917");
  const [lineWidth, setLineWidth] = useState(3);
  const [fillShape, setFillShape] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  function getCtx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function syncHistoryFlags() {
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(redoRef.current.length > 0);
  }

  function pushHistory() {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    historyRef.current.push(ctx.getImageData(0, 0, W, H));
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    redoRef.current = [];
    syncHistoryFlags();
  }

  function fillWhite() {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }

  useEffect(() => {
    fillWhite();
  }, []);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
    clear: () => {
      pushHistory();
      fillWhite();
    },
  }));

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * W) / rect.width,
      y: ((e.clientY - rect.top) * H) / rect.height,
    };
  }

  function strokeStyleForTool(): {
    stroke: string;
    width: number;
    alpha: number;
    composite: GlobalCompositeOperation;
  } {
    if (tool === "eraser") {
      return {
        stroke: "#ffffff",
        width: Math.max(lineWidth, 8),
        alpha: 1,
        composite: "source-over",
      };
    }
    if (tool === "brush") {
      return {
        stroke: color,
        width: Math.max(lineWidth * 2, 6),
        alpha: 0.55,
        composite: "source-over",
      };
    }
    return {
      stroke: color,
      width: lineWidth,
      alpha: 1,
      composite: "source-over",
    };
  }

  function drawShapePreview(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.globalAlpha = 1;
    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    } else if (tool === "rect") {
      const w = x1 - x0;
      const h = y1 - y0;
      if (fillShape) ctx.fillRect(x0, y0, w, h);
      else ctx.strokeRect(x0, y0, w, h);
    } else if (tool === "ellipse") {
      const rx = Math.abs(x1 - x0) / 2;
      const ry = Math.abs(y1 - y0) / 2;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 0.5), Math.max(ry, 0.5), 0, 0, Math.PI * 2);
      if (fillShape) ctx.fill();
      else ctx.stroke();
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const { x, y } = getPos(e);

    if (tool === "eyedropper") {
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const hex =
        "#" +
        [pixel[0], pixel[1], pixel[2]]
          .map((v) => v.toString(16).padStart(2, "0"))
          .join("");
      setColor(hex);
      return;
    }

    if (tool === "fill") {
      pushHistory();
      floodFill(ctx, x, y, color);
      return;
    }

    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    startRef.current = { x, y };

    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      snapshotRef.current = ctx.getImageData(0, 0, W, H);
      pushHistory();
      return;
    }

    pushHistory();
    const s = strokeStyleForTool();
    ctx.globalCompositeOperation = s.composite;
    ctx.globalAlpha = s.alpha;
    ctx.strokeStyle = s.stroke;
    ctx.lineWidth = s.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const { x, y } = getPos(e);
    const start = startRef.current;

    if (
      (tool === "line" || tool === "rect" || tool === "ellipse") &&
      start &&
      snapshotRef.current
    ) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      drawShapePreview(ctx, start.x, start.y, x, y);
      return;
    }

    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      const s = strokeStyleForTool();
      ctx.globalCompositeOperation = s.composite;
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = s.stroke;
      ctx.lineWidth = s.width;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    const ctx = getCtx();
    const start = startRef.current;
    if (
      ctx &&
      start &&
      (tool === "line" || tool === "rect" || tool === "ellipse") &&
      snapshotRef.current
    ) {
      const { x, y } = getPos(e);
      ctx.putImageData(snapshotRef.current, 0, 0);
      drawShapePreview(ctx, start.x, start.y, x, y);
    }
    const c = getCtx();
    if (c) {
      c.globalAlpha = 1;
      c.globalCompositeOperation = "source-over";
    }
    startRef.current = null;
    snapshotRef.current = null;
  }

  function undo() {
    const ctx = getCtx();
    if (!ctx || historyRef.current.length === 0) return;
    redoRef.current.push(ctx.getImageData(0, 0, W, H));
    const prev = historyRef.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    syncHistoryFlags();
  }

  function redo() {
    const ctx = getCtx();
    if (!ctx || redoRef.current.length === 0) return;
    historyRef.current.push(ctx.getImageData(0, 0, W, H));
    const next = redoRef.current.pop()!;
    ctx.putImageData(next, 0, 0);
    syncHistoryFlags();
  }

  function clear() {
    pushHistory();
    fillWhite();
  }

  return (
    <div>
      <PaintToolbar
        tool={tool}
        color={color}
        lineWidth={lineWidth}
        fillShape={fillShape}
        canUndo={canUndo}
        canRedo={canRedo}
        onToolChange={setTool}
        onColorChange={setColor}
        onLineWidthChange={setLineWidth}
        onFillShapeChange={setFillShape}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
      />
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full max-w-full touch-none rounded-2xl border border-[var(--border)] bg-white"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </div>
  );
});
