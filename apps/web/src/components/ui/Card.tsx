import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const paddingClass = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

export function Card({
  title,
  children,
  className = "",
  padding = "md",
}: CardProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-[var(--border)] bg-[var(--panel)]",
        paddingClass[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}
