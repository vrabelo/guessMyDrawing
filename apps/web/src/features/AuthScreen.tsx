import { useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { api } from "../api/client";

type AuthScreenProps = {
  onLoggedIn: (user: { id: string; alias: string }) => void;
};

type AuthMode = "login" | "register";

export function AuthScreen({ onLoggedIn }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [alias, setAlias] = useState("Bela");
  const [pass, setPass] = useState("bela");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
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

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl bg-[var(--panel)]/90 p-6 shadow-[0_0_40px_rgba(45,212,191,0.12)] ring-1 ring-white/10 backdrop-blur-sm">
      <h1 className="font-display mb-1 text-center text-2xl font-bold tracking-tight text-[var(--ink)] sm:text-3xl">
        <span className="bg-gradient-to-r from-[var(--accent)] to-[#5eead4] bg-clip-text text-transparent">
          Találd ki mit rajzoltam
        </span>
      </h1>
      <p className="mb-6 text-center text-sm text-[var(--muted)]">
        Rajzolj és tippelj
      </p>

      <div className="mb-4 flex gap-2">
        <Button
          label="Bejelentkezés"
          variant={mode === "login" ? "primary" : "secondary"}
          type="button"
          fullWidth
          onClick={() => {
            setMode("login");
            setError("");
          }}
        />
        <Button
          label="Regisztráció"
          variant={mode === "register" ? "primary" : "secondary"}
          type="button"
          fullWidth
          onClick={() => {
            setMode("register");
            setError("");
          }}
        />
      </div>

      <form className="flex flex-col gap-3" onSubmit={(e) => void handleSubmit(e)}>
        <TextField
          label="Felhasználónév"
          name="alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          autoComplete="username"
        />
        <TextField
          label="Jelszó"
          name="pass"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
        />
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <Button
          label={mode === "login" ? "Bejelentkezés" : "Regisztráció"}
          variant="primary"
          type="submit"
          fullWidth
          disabled={busy}
          className="mt-2"
        />
      </form>
    </div>
  );
}
