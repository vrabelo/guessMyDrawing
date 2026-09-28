import { Check, X } from "lucide-react";

export type ResultOverlayState =
  | { kind: "success"; points: number }
  | { kind: "failure" }
  | { kind: "expired"; answer: string }
  | { kind: "wrong"; guess: string }
  | null;

type ResultOverlayProps = {
  result: ResultOverlayState;
  onDismissWrong?: () => void;
};

export function ResultOverlay({ result, onDismissWrong }: ResultOverlayProps) {
  if (!result) return null;

  const success = result.kind === "success";
  const wrong = result.kind === "wrong";
  const failure = result.kind === "failure";
  const expired = result.kind === "expired";

  return (
    <div
      className={[
        "result-overlay absolute inset-0 z-30 flex items-center justify-center p-4",
        wrong ? "result-overlay--dismissible" : "",
      ].join(" ")}
      role="dialog"
      aria-live="polite"
      aria-label={
        success
          ? "Sikeres tipp"
          : wrong
            ? "Rossz tipp"
            : expired
              ? "Idő lejárt"
              : "Sikertelen tipp"
      }
      onClick={wrong ? onDismissWrong : undefined}
    >
      <div
        className={[
          "result-overlay__card flex max-w-sm flex-col items-center gap-3 px-7 py-6 text-center",
          success
            ? "result-overlay__card--success"
            : "result-overlay__card--failure",
        ].join(" ")}
        onClick={wrong ? (e) => e.stopPropagation() : undefined}
      >
        <span
          className={[
            "flex h-14 w-14 items-center justify-center rounded-full",
            success
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400",
          ].join(" ")}
        >
          {success ? (
            <Check size={32} strokeWidth={2.75} />
          ) : (
            <X size={32} strokeWidth={2.75} />
          )}
        </span>
        <p className="text-base font-semibold leading-snug text-[var(--ink)]">
          {success ? (
            <>
              Gratulálunk!{" "}
              <span className="text-emerald-400">
                {Number.isInteger(result.points)
                  ? result.points
                  : result.points.toFixed(1).replace(".", ",")}
              </span>{" "}
              pontot szereztél
            </>
          ) : wrong ? (
            <>
              <span className="block text-lg text-red-300">Rossz tipp</span>
              <span className="mt-1 block text-[var(--muted-strong)]">
                „{result.guess}” nem a megfejtés.
              </span>
            </>
          ) : expired ? (
            <>
              <span className="block text-lg text-red-300">Idő lejárt</span>
              <span className="mt-1 block text-[var(--muted-strong)]">
                A teljes megfejtés: „{result.answer}”
              </span>
            </>
          ) : failure ? (
            <>
              Sajnos nem talált. Következő körben csak fél pontot kaphatsz a
              képért.
            </>
          ) : null}
        </p>
        {wrong ? (
          <button
            type="button"
            className="mt-1 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-white/10"
            onClick={onDismissWrong}
          >
            Rendben
          </button>
        ) : null}
      </div>
    </div>
  );
}
