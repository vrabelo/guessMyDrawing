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
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] border-transparent",
  secondary:
    "bg-white text-[var(--ink)] border-[var(--border)] hover:bg-stone-50",
  ghost: "bg-transparent text-[var(--ink)] border-transparent hover:bg-black/5",
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
    ? "ring-2 ring-[var(--accent)] border-[var(--accent)]"
    : "";

  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
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
