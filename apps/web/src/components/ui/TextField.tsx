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
    <label className="flex w-full flex-col gap-1 text-sm">
      {label ? (
        <span className="font-medium text-stone-700">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={[
          "rounded-md border border-[var(--border)] bg-white px-3 py-2 outline-none",
          "focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]",
          className,
        ].join(" ")}
        {...rest}
      />
    </label>
  );
}
