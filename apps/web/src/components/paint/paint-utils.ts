import { CANVAS_H, CANVAS_W } from "@tipp-my-draw/shared";

export const PAINT_W = CANVAS_W;
export const PAINT_H = CANVAS_H;
export const MAX_HISTORY = 40;

export function hexToRgba(hex: string): [number, number, number, number] {
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

export function colorsMatch(
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

export function floodFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillHex: string
) {
  const img = ctx.getImageData(0, 0, PAINT_W, PAINT_H);
  const { data } = img;
  const sx = Math.floor(x);
  const sy = Math.floor(y);
  if (sx < 0 || sy < 0 || sx >= PAINT_W || sy >= PAINT_H) return;

  const startIdx = (sy * PAINT_W + sx) * 4;
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
    const i = (cy * PAINT_W + cx) * 4;
    if (!colorsMatch(data, i, target)) continue;
    data[i] = fill[0];
    data[i + 1] = fill[1];
    data[i + 2] = fill[2];
    data[i + 3] = fill[3];
    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < PAINT_W - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < PAINT_H - 1) stack.push([cx, cy + 1]);
  }
  ctx.putImageData(img, 0, 0);
}
