import api from "#/lib/api";
import type { NotificationResponse } from "#/lib/types";

export const NOTIFICATION_STATUS_LABELS: Record<string, string> = {
  READ: "Прочитано",
  UNREAD: "Новое",
  read: "Прочитано",
  unread: "Новое",
};

export const countUnreadNotifications = (
  notifications: NotificationResponse[],
): number => {
  return notifications.filter((n) => !n.read).length;
};

export const getNotifications = async (): Promise<
  [NotificationResponse[], null] | [null, string]
> => {
  try {
    const data = await api.notifications.list();
    return [data, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить уведомления";
    return [null, message];
  }
};

export const getUnreadCount = async (): Promise<
  [number, null] | [null, string]
> => {
  try {
    const data = await api.notifications.unreadCount();
    return [data.count, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось получить количество непрочитанных уведомлений";
    return [null, message];
  }
};

export const markNotificationRead = async (
  id: number,
): Promise<[true, null] | [null, string]> => {
  try {
    await api.notifications.markRead(id);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось отметить уведомление как прочитанное";
    return [null, message];
  }
};

export const markAllNotificationsRead = async (): Promise<
  [number, null] | [null, string]
> => {
  try {
    const res = await api.notifications.markAllRead();
    return [res.updated, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось отметить все уведомления как прочитанные";
    return [null, message];
  }
};
