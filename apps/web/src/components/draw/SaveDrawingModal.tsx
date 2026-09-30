import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import "../game/game-dialog.css";

export type SaveDrawingMeta = {
  theme: string;
  hint1: string;
  hint2: string;
  hint3: string;
  name: string;
};

type SaveDrawingModalProps = {
  open: boolean;
  initial: SaveDrawingMeta;
  /** When true, theme + answer come from the guided word bank and stay locked. */
  guidedLock?: boolean;
  /** Time ran out — cancel is blocked until the drawing is saved or discarded. */
  forceSave?: boolean;
  busy?: boolean;
  error?: string;
  /** Cover only the paper host (keeps tool chrome visible). */
  scoped?: boolean;
  onCancel: () => void;
  onDiscard: () => void;
  onConfirm: (meta: SaveDrawingMeta) => void;
};

export function SaveDrawingModal({
  open,
  initial,
  guidedLock = false,
  forceSave = false,
  busy = false,
  error = "",
  scoped = false,
  onCancel,
  onDiscard,
  onConfirm,
}: SaveDrawingModalProps) {
  const [hint1, setHint1] = useState(initial.hint1);
  const [name, setName] = useState(initial.name);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    setHint1(initial.hint1);
    setName(initial.name);
    setLocalError("");
  }, [open, initial]);

  if (!open) return null;

  function publish() {
    if (!name.trim()) {
      setLocalError("A megfejtés (név) megadása kötelező.");
      return;
    }
    setLocalError("");
    onConfirm({
      theme: "",
      hint1,
      hint2: "",
      hint3: "",
      name,
    });
  }

  return (
    <div
      className={
        scoped
          ? "game-dialog"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-drawing-title"
    >
      <div
        className={
          scoped
            ? "game-dialog__card w-full max-w-md text-left"
            : "w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--panel-solid)] p-5 shadow-xl"
        }
      >
        <h2
          id="save-drawing-title"
          className="mb-1 text-lg font-semibold text-[var(--ink)]"
        >
          Rajz mentése
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          {forceSave
            ? "Lejárt a 120 másodperc — publikáld a rajzot, vagy dobd el. Később nem folytatható."
            : "Add meg a feladvány adatait, majd publikáld. A rajz a Kitalálom módban jelenik meg, és többé nem szerkeszthető."}
        </p>
        <div className="flex flex-col gap-3">
          <TextField
            label="HINT"
            name="hint1"
            value={hint1}
            onChange={(e) => setHint1(e.target.value)}
          />
          <TextField
            label="Megfejtés (név)"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={guidedLock}
            readOnly={guidedLock}
          />
          {guidedLock ? (
            <p className="text-xs text-[var(--muted)]">
              Ajánlott mód: a megfejtés a szóbankból jön, nem módosítható.
            </p>
          ) : null}
        </div>
        {(localError || error) && (
          <p className="mt-3 text-sm text-[var(--danger)]">
            {localError || error}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {!forceSave ? (
            <Button
              label="Mégse"
              variant="ghost"
              onClick={onCancel}
              disabled={busy}
            />
          ) : null}
          <Button
            label="Eldobás"
            variant="secondary"
            onClick={onDiscard}
            disabled={busy}
          />
          <Button
            label="Publikálás"
            variant="outline"
            onClick={publish}
            disabled={busy}
          />
        </div>
      </div>
    </div>
  );
}
