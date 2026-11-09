import { AuthForm } from "#/components/auth/AuthForm";
import { createFileRoute } from "@tanstack/react-router";
import "#/assets/css/auth.css";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="box-container">
      <div className="box">
        <AuthForm type="login" />
      </div>
    </div>
  );
}
