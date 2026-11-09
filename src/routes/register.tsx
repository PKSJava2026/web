import { AuthForm } from "#/components/auth/AuthForm";
import { createFileRoute } from "@tanstack/react-router";
import "#/assets/css/auth.css";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="box-container">
      <div className="box">
        <AuthForm type="register" />
      </div>
    </div>
  );
}
