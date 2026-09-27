export type PaintTool =
  | "pencil"
  | "brush"
  | "eraser"
  | "line"
  | "rect"
  | "ellipse"
  | "fill"
  | "eyedropper";

export const PAINT_TOOLS: { id: PaintTool; label: string }[] = [
  { id: "pencil", label: "Ceruza" },
  { id: "brush", label: "Ecset" },
  { id: "eraser", label: "Radír" },
  { id: "line", label: "Vonal" },
  { id: "rect", label: "Téglalap" },
  { id: "ellipse", label: "Ellipszis" },
  { id: "fill", label: "Kitöltés" },
  { id: "eyedropper", label: "Pipetta" },
];
