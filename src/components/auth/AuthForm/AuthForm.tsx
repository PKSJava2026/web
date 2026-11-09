import { Input } from "#/components/ui/Input";
import { useState, type ChangeEvent } from "react";
import "./AuthForm.css";
import {
  login,
  register,
  type LoginInput,
  type RegisterInput,
} from "#/services/auth";
import type { FieldErrors } from "#/lib/validation";
import { Button } from "#/components/ui/Button";
import { Link } from "@tanstack/react-router";
import { Select } from "#/components/ui/Select";

type FormErrors = FieldErrors<
  RegisterInput &
    LoginInput & { passwordConfirmation?: string; general?: string }
>;

export const AuthForm = ({ type }: { type: "login" | "register" }) => {
  type ROLES = "CUSTOMER" | "CARRIER";

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState<ROLES>("CUSTOMER");

  const [errors, setErrors] = useState<FormErrors>({});

  async function onSubmit(e: ChangeEvent) {
    e.preventDefault();

    if (type == "login") {
      const [res, err] = await login({ nickname, password });

      if (err) {
        setErrors(err);
      }
    } else {
      const [res, err] = await register({ nickname, email, password, role });

      if (err) {
        setErrors(err);
      }
    }
  }

  if (type == "login") {
    return (
      <div className="auth-form">
        <h2>Вход в систему</h2>
        <form onSubmit={() => onSubmit}>
          <label htmlFor="nickname">Никнейм</label>
          <Input
            placeholder="Введите никнейм"
            id="nickname"
            error={errors.nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <label htmlFor="password">Пароль</label>
          <Input
            placeholder="Введите пароль"
            id="password"
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button>Войти</Button>
          <Link className="auth-link" to="/register">
            Нет аккаунта? Зарегистрироваться
          </Link>
        </form>
      </div>
    );
  } else {
    return (
      <div className="auth-form">
        <h2>Регистрация</h2>
        <form onSubmit={() => onSubmit}>
          <label htmlFor="nickname">Никнейм</label>
          <Input
            placeholder="Введите никнейм"
            id="nickname"
            error={errors.nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <label htmlFor="email">Email</label>
          <Input
            placeholder="Введите email"
            id="email"
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">Пароль</label>
          <Input
            placeholder="Введите пароль"
            id="password"
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="passwordConfirmation">Пароль</label>
          <Input
            placeholder="Повторите пароль"
            id="passwordConfirmation"
            error={errors.passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          <label htmlFor="role">Роль</label>
          <Select
            id="role"
            onChange={(e) => setRole(e.target.value as ROLES)}
            options={[
              { name: "Заказчик", value: "CUSTOMER" },
              { name: "Перевозчик", value: "CARRIER" },
            ]}
          />
          <Button>Зарегистрироваться</Button>
          <Link className="auth-link" to="/register">
            Уже есть аккаунт? Войти
          </Link>
        </form>
      </div>
    );
  }
};
