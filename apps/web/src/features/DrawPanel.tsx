import { useRef, useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { TextField } from "../components/ui/TextField";
import { api } from "../api/client";
import {
  PaintCanvas,
  type PaintCanvasHandle,
} from "../components/paint/PaintCanvas";

type DrawPanelProps = {
  onSaved: () => void;
};

export function DrawPanel({ onSaved }: DrawPanelProps) {
  const paintRef = useRef<PaintCanvasHandle>(null);
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [hint3, setHint3] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    const imageDataUrl = paintRef.current?.toDataURL() ?? "";
    try {
      await api.createDrawing({
        hint1,
        hint2,
        hint3,
        name,
        imageDataUrl,
      });
      setMessage("Mentve — elérhető Játszom módban.");
      setHint1("");
      setHint2("");
      setHint3("");
      setName("");
      paintRef.current?.clear();
      onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Mentés sikertelen.");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <Card title="Rajz" padding="md">
        <PaintCanvas ref={paintRef} />
      </Card>

      <Card title="Adatok" padding="md">
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
      </Card>
    </div>
  );
}
