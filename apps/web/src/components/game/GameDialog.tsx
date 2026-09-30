import type { ReactNode } from "react";
import { Button } from "../ui/Button";
import "./game-dialog.css";

export type GameDialogTone = "neutral" | "success" | "danger";

type GameDialogProps = {
  open: boolean;
  title: string;
  body?: ReactNode;
  tone?: GameDialogTone;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryDisabled?: boolean;
  /** Accessible name; defaults to title. */
  ariaLabel?: string;
};

export function GameDialog({
  open,
  title,
  body,
  tone = "neutral",
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  secondaryLabel,
  onSecondary,
  secondaryDisabled = false,
  ariaLabel,
}: GameDialogProps) {
  if (!open) return null;

  const dual = Boolean(secondaryLabel && onSecondary);

  return (
    <div
      className="game-dialog"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
      aria-labelledby="game-dialog-title"
    >
      <div
        className={[
          "game-dialog__card",
          tone === "success" ? "game-dialog__card--success" : "",
          tone === "danger" ? "game-dialog__card--danger" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <h2 id="game-dialog-title" className="game-dialog__title">
          {title}
        </h2>
        {body != null ? (
          <div className="game-dialog__body">{body}</div>
        ) : null}
        <div
          className={[
            "game-dialog__actions",
            dual ? "game-dialog__actions--dual" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {dual ? (
            <Button
              label={secondaryLabel!}
              variant="secondary"
              disabled={secondaryDisabled}
              onClick={onSecondary}
            />
          ) : null}
          <Button
            label={primaryLabel}
            variant="outline"
            disabled={primaryDisabled}
            onClick={onPrimary}
          />
        </div>
      </div>
    </div>
  );
}
