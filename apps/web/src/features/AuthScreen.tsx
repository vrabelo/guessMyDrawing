import { useState, type FormEvent } from "react";
import { Button } from "../components/ui/Button";
import { TextField } from "../components/ui/TextField";
import { Modal } from "../components/ui/Modal";
import { api } from "../api/client";

type AuthScreenProps = {
  onLoggedIn: (user: { id: string; alias: string }) => void;
};

export function AuthScreen({ onLoggedIn }: AuthScreenProps) {
  const [alias, setAlias] = useState("Bela");
  const [pass, setPass] = useState("bela");
  const [error, setError] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(
    "Később kerül kidolgozásra."
  );

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const result = await api.login({ alias, pass });
      onLoggedIn(result.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bejelentkezés sikertelen.");
    }
  }

  async function handleRegister() {
    try {
      const res = await api.registerStub();
      setRegisterMessage(res.message);
    } catch (err) {
      setRegisterMessage(
        err instanceof Error ? err.message : "Később kerül kidolgozásra."
      );
    }
    setRegisterOpen(true);
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight">
        Tipp my draw
      </h1>
      <p className="mb-6 text-center text-sm text-stone-500">
        Rajzolj és tippelj
      </p>

      <form className="flex flex-col gap-3" onSubmit={handleLogin}>
        <TextField
          label="Alias"
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
          autoComplete="current-password"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="mt-2 flex gap-2">
          <Button label="Login" variant="primary" type="submit" fullWidth />
          <Button
            label="Register"
            variant="secondary"
            type="button"
            fullWidth
            onClick={handleRegister}
          />
        </div>
      </form>

      <Modal
        open={registerOpen}
        title="Register"
        message={registerMessage}
        onClose={() => setRegisterOpen(false)}
      />
    </div>
  );
}
