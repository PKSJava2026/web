import { z } from "zod";
import api, { setAuthToken } from "#/lib/api";
import { validate, type FieldErrors } from "#/lib/validation";
import type { LoginResponse, UserResponse } from "#/lib/types";

export const loginSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Имя пользователя обязательно для заполнения"),
  password: z.string().min(1, "Пароль обязателен для заполнения"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "Никнейм должен быть от 3 до 50 символов")
    .max(50, "Никнейм должен быть от 3 до 50 символов"),
  email: z.email("Некорректный формат email").trim(),
  password: z
    .string()
    .min(8, "Пароль должен содержать минимум 8 символов")
    .max(72, "Пароль не должен превышать 72 символа"),
  role: z.enum(["CUSTOMER", "CARRIER", "FORWARDER", "ADMIN"], {
    error: "Выберите роль",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const login = async (
  data: LoginInput
): Promise<[LoginResponse, null] | [null, FieldErrors<LoginInput>]> => {
  const [valid, err] = validate(loginSchema, data);
  if (err) return [null, err];
  const res = await api.auth.login(valid);
  if (res.token) setAuthToken(res.token);
  return [res, null];
};

export const register = async (
  data: RegisterInput
): Promise<[UserResponse, null] | [null, FieldErrors<RegisterInput>]> => {
  const [valid, err] = validate(registerSchema, data);
  if (err) return [null, err];
  const res = await api.auth.register(valid);
  return [res, null];
};
