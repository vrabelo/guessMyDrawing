import { useState } from "react";
import { Button } from "../components/ui/Button";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";
import "../components/auth/auth.css";

type AuthScreenProps = {
  onLoggedIn: (user: { id: string; alias: string }) => void;
};

type AuthMode = "login" | "register";

export function AuthScreen({ onLoggedIn }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="auth-screen">
      <h1 className="auth-screen__title">
        <span className="auth-screen__title-gradient">
          Találd ki mit rajzoltam
        </span>
      </h1>
      <p className="auth-screen__subtitle">Rajzolj és tippelj</p>

      <div className="auth-screen__tabs">
        <Button
          label="Bejelentkezés"
          variant={mode === "login" ? "primary" : "secondary"}
          type="button"
          onClick={() => setMode("login")}
        />
        <Button
          label="Regisztráció"
          variant={mode === "register" ? "primary" : "secondary"}
          type="button"
          onClick={() => setMode("register")}
        />
      </div>

      {mode === "login" ? (
        <LoginForm onLoggedIn={onLoggedIn} />
      ) : (
        <RegisterForm onLoggedIn={onLoggedIn} />
      )}
    </div>
  );
}
