import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: ReactNode;
  variant?: Variant;
  active?: boolean;
  fullWidth?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[#042f2e] hover:bg-[var(--accent-hover)] border-transparent shadow-[0_0_20px_rgba(45,212,191,0.25)]",
  secondary:
    "bg-[var(--panel-elevated)] text-[var(--ink)] border-[var(--border)] hover:bg-[#22222a] hover:border-[var(--accent)]/30",
  ghost:
    "bg-transparent text-[var(--muted)] border-transparent hover:bg-white/5 hover:text-[var(--ink)]",
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
        "inline-flex cursor-pointer items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-40",
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
