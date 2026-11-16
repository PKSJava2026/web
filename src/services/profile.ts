import api from "#/lib/api";
import type { Role, UserResponse } from "#/lib/types";
import { useAuthStore } from "#/store/useAuthStore";

export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Заказчик",
  CARRIER: "Перевозчик",
  FORWARDER: "Экспедитор",
  ADMIN: "Администратор",
};

export const getProfile = async (): Promise<
  [UserResponse, null] | [null, string]
> => {
  try {
    const user = await api.users.me();
    useAuthStore.getState().setUser(user);
    return [user, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось загрузить данные профиля";
    return [null, message];
  }
};
