import { Sparkles } from "lucide-react";
import type { AppMode } from "../shell/ModeToggle.types";

type GameRulesBannerProps = {
  mode: AppMode;
  compact?: boolean;
};

export function GameRulesBanner({ mode, compact = false }: GameRulesBannerProps) {
  const text =
    mode === "play"
      ? "Nézd meg a rajzot, használd a hintet, és tippelj!"
      : "Rajzolj, adj egy hintet, és mentsd el a megfejtést.";

  return (
    <div
      className={[
        "info-banner flex w-full shrink-0 items-start gap-2.5 rounded-3xl",
        compact ? "px-3.5 py-3" : "items-center justify-center px-5 py-3",
      ].join(" ")}
    >
      <Sparkles
        size={15}
        strokeWidth={2.25}
        className="mt-0.5 shrink-0 text-[var(--accent)]"
        aria-hidden
      />
      <p
        className={[
          "font-medium tracking-wide text-[var(--muted-strong)]",
          compact ? "text-left text-[13px] leading-snug" : "text-center text-sm sm:text-[0.9375rem]",
        ].join(" ")}
      >
        {text}
      </p>
    </div>
  );
}
