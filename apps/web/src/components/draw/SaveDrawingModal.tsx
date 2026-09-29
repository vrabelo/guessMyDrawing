import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";

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
  onCancel: () => void;
  onDiscard: () => void;
  onConfirm: (meta: SaveDrawingMeta, published: boolean) => void;
};

type Step = "meta" | "publish";

export function SaveDrawingModal({
  open,
  initial,
  guidedLock = false,
  forceSave = false,
  busy = false,
  error = "",
  onCancel,
  onDiscard,
  onConfirm,
}: SaveDrawingModalProps) {
  const [step, setStep] = useState<Step>("meta");
  const [hint1, setHint1] = useState(initial.hint1);
  const [name, setName] = useState(initial.name);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep("meta");
    setHint1(initial.hint1);
    setName(initial.name);
    setLocalError("");
  }, [open, initial]);

  if (!open) return null;

  function goPublishStep() {
    if (!name.trim()) {
      setLocalError("A megfejtés (név) megadása kötelező.");
      return;
    }
    setLocalError("");
    setStep("publish");
  }

  const meta: SaveDrawingMeta = {
    theme: "",
    hint1,
    hint2: "",
    hint3: "",
    name,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-drawing-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel-solid)] p-5 shadow-xl">
        {step === "meta" ? (
          <>
            <h2
              id="save-drawing-title"
              className="mb-1 text-lg font-semibold text-[var(--ink)]"
            >
              Rajz mentése
            </h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              {forceSave
                ? "Lejárt a 120 másodperc — a rajzot el kell mentened (vázlatként vagy publikálva)."
                : "Add meg a feladvány adatait, majd döntsd el, publikálod-e."}
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
            <div className="mt-5 flex gap-2">
              {!forceSave ? (
                <Button
                  label="Mégse"
                  variant="ghost"
                  onClick={onCancel}
                  disabled={busy}
                  className="flex-1"
                />
              ) : null}
              <Button
                label="Eldobás"
                variant="secondary"
                onClick={onDiscard}
                disabled={busy}
                className="flex-1"
              />
              <Button
                label="Tovább"
                variant="primary"
                onClick={goPublishStep}
                disabled={busy}
                className="flex-1"
              />
            </div>
          </>
        ) : (
          <>
            <h2
              id="save-drawing-title"
              className="mb-1 text-lg font-semibold text-[var(--ink)]"
            >
              Publikálható-e?
            </h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Ha igen, a rajz megjelenik Játszom módban, és többé nem
              szerkeszthető. Ha nem, vázlatként mentjük — később még
              módosíthatod.
            </p>
            {error ? (
              <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Button
                label="Igen — publikálás"
                variant="primary"
                fullWidth
                disabled={busy}
                onClick={() => onConfirm(meta, true)}
              />
              <Button
                label="Nem — mentés vázlatként"
                variant="secondary"
                fullWidth
                disabled={busy}
                onClick={() => onConfirm(meta, false)}
              />
              <Button
                label="Vissza"
                variant="ghost"
                fullWidth
                disabled={busy}
                onClick={() => setStep("meta")}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
