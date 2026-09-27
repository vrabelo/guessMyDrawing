import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { api } from "../api/client";

type DrawPanelProps = {
  onSaved: () => void;
};

export function DrawPanel({ onSaved }: DrawPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState("#1c1917");
  const [lineWidth, setLineWidth] = useState(3);
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [hint3, setHint3] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      await api.createDrawing({
        hint1,
        hint2,
        hint3,
        name,
        imageDataUrl: canvas.toDataURL("image/png"),
      });
      setMessage("Mentve — elérhető Játszom módban.");
      setHint1("");
      setHint2("");
      setHint3("");
      setName("");
      clearCanvas();
      onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Mentés sikertelen.");
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              Szín
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              Vastagság
              <input
                type="range"
                min={1}
                max={16}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
              />
            </label>
            <Button label="Törlés" variant="ghost" onClick={clearCanvas} />
          </div>
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            className="w-full max-w-full touch-none rounded-lg border border-stone-300 bg-white"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSave}>
          <TextField
            label="HINT 1"
            name="hint1"
            value={hint1}
            onChange={(e) => setHint1(e.target.value)}
          />
          <TextField
            label="HINT 2"
            name="hint2"
            value={hint2}
            onChange={(e) => setHint2(e.target.value)}
          />
          <TextField
            label="HINT 3"
            name="hint3"
            value={hint3}
            onChange={(e) => setHint3(e.target.value)}
          />
          <TextField
            label="Megfejtés (név)"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button label="Mentés" variant="primary" type="submit" fullWidth />
          {message ? (
            <p className="text-sm text-[var(--accent)]">{message}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
