import type { InputHTMLAttributes } from "react";

type TextFieldProps = {
  label?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({
  label,
  className = "",
  id,
  ...rest
}: TextFieldProps) {
  const inputId = id ?? rest.name;

  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium text-[var(--muted)]">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={[
          "rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)] px-4 py-2.5 text-[var(--ink)] outline-none",
          "placeholder:text-[var(--muted)]",
          "focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]",
          className,
        ].join(" ")}
        {...rest}
      />
    </label>
  );
}
