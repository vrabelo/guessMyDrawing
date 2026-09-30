import { useState, type FormEvent } from "react";
import { api } from "../../api/client";

export type AuthCredentials = {
  alias: string;
  pass: string;
};

type UseAuthFormOptions = {
  mode: "login" | "register";
  onLoggedIn: (user: { id: string; alias: string }) => void;
};

export function useAuthForm({ mode, onLoggedIn }: UseAuthFormOptions) {
  const [alias, setAlias] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result =
        mode === "login"
          ? await api.login({ alias, pass })
          : await api.register({ alias, pass });
      onLoggedIn(result.user);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : mode === "login"
            ? "Bejelentkezés sikertelen."
            : "Regisztráció sikertelen."
      );
    } finally {
      setBusy(false);
    }
  }

  function clearError() {
    setError("");
  }

  return {
    alias,
    pass,
    error,
    busy,
    setAlias,
    setPass,
    submit,
    clearError,
  };
}
