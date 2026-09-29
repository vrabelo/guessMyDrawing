import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type ButtonProps = {
  label: ReactNode;
  variant?: Variant;
  active?: boolean;
  fullWidth?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[#042f2e] hover:bg-[var(--accent-hover)] border-transparent shadow-[0_0_20px_rgba(45,212,191,0.22)] hover:shadow-[0_0_28px_rgba(45,212,191,0.35)]",
  secondary:
    "bg-[var(--surface)] text-[var(--ink)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--panel-elevated)]",
  ghost:
    "bg-transparent text-[var(--muted)] border-transparent hover:bg-white/[0.06] hover:text-[var(--ink)]",
  outline:
    "bg-transparent text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent-muted)] hover:border-[var(--accent-hover)] shadow-none",
};

export function Button({
  label,
  variant = "secondary",
  active = false,
  fullWidth = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const activeClass = active
    ? "ring-2 ring-[var(--accent)] border-[var(--accent)] shadow-[0_0_16px_rgba(45,212,191,0.2)]"
    : "";

  return (
    <button
      type={type}
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold",
        "transition-all duration-200 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "active:scale-[0.98]",
        variantClass[variant],
        activeClass,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {label}
    </button>
  );
}
