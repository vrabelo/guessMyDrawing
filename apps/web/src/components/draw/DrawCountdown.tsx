type DrawCountdownProps = {
  label: string;
  urgent?: boolean;
};

export function DrawCountdown({ label, urgent = false }: DrawCountdownProps) {
  return (
    <p
      className={[
        "draw-countdown-overlay",
        urgent ? "draw-countdown-overlay--urgent" : "",
      ].join(" ")}
      aria-live="polite"
    >
      {label}
    </p>
  );
}

export function formatDrawCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
