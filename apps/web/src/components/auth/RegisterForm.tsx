import { Button } from "../ui/Button";
import { TextField } from "../ui/TextField";
import { useAuthForm } from "./useAuthForm";

type RegisterFormProps = {
  onLoggedIn: (user: { id: string; alias: string }) => void;
};

export function RegisterForm({ onLoggedIn }: RegisterFormProps) {
  const form = useAuthForm({ mode: "register", onLoggedIn });

  return (
    <form className="auth-form" onSubmit={(e) => void form.submit(e)}>
      <TextField
        label="Felhasználónév"
        name="alias"
        value={form.alias}
        onChange={(e) => form.setAlias(e.target.value)}
        autoComplete="username"
      />
      <TextField
        label="Jelszó"
        name="pass"
        type="password"
        value={form.pass}
        onChange={(e) => form.setPass(e.target.value)}
        autoComplete="new-password"
      />
      {form.error ? <p className="auth-form__error">{form.error}</p> : null}
      <Button
        label="Regisztráció"
        variant="primary"
        type="submit"
        disabled={form.busy}
        className="auth-form__submit"
      />
    </form>
  );
}
