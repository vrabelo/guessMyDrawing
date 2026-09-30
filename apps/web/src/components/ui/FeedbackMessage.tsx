import { useEffect } from "react";
import "./feedback-message.css";

export type FeedbackTone = "warning" | "error" | "info";

type FeedbackMessageProps = {
  open: boolean;
  message: string;
  tone?: FeedbackTone;
  /** Auto-hide after this many ms. Default 3000. */
  durationMs?: number;
  onClose: () => void;
  title?: string;
};

export function FeedbackMessage({
  open,
  message,
  tone = "warning",
  durationMs = 3000,
  onClose,
  title,
}: FeedbackMessageProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(id);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const heading =
    title ??
    (tone === "error" ? "Hiba" : tone === "info" ? "Infó" : "Info");

  return (
    <div
      className="feedback-message"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={[
          "feedback-message__box",
          `feedback-message__box--${tone}`,
        ].join(" ")}
      >
        <p className="feedback-message__title">{heading}</p>
        <p className="feedback-message__text">{message}</p>
      </div>
    </div>
  );
}
