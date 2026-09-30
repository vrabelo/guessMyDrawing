import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

export function Modal({ open, title, message, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-xl">
        <h2 id="modal-title" className="mb-2 text-lg font-semibold text-[var(--ink)]">
          {title}
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">{message}</p>
        <Button label="OK" variant="primary" onClick={onClose} fullWidth />
      </div>
    </div>
  );
}
