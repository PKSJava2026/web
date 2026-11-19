import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";
import type { NotificationResponse } from "#/lib/types";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  countUnreadNotifications,
} from "#/services/notifications";
import {
  NotificationsTable,
  NotificationDetailsCard,
} from "#/components/notifications";
import { Button } from "#/components/ui/Button";
import "./notifications.css";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const user = useAuthStore((state) => state.user);

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (preserveSelectedId?: number | null) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      const [data, err] = await getNotifications();
      setIsLoading(false);

      if (err) {
        setError(err);
        return;
      }

      if (data) {
        setNotifications(data);
        const targetId =
          preserveSelectedId !== undefined ? preserveSelectedId : selectedId;
        if (targetId !== null && data.some((n) => n.id === targetId)) {
          setSelectedId(targetId);
        } else {
          setSelectedId(null);
        }
      }
    },
    [user, selectedId],
  );

  useEffect(() => {
    loadData();
  }, [user]);

  const selectedNotification = useMemo(
    () => notifications.find((n) => n.id === selectedId) || null,
    [notifications, selectedId],
  );

  const unreadCount = useMemo(
    () => countUnreadNotifications(notifications),
    [notifications],
  );

  const handleSelectRow = useCallback((notification: NotificationResponse) => {
    setSelectedId(notification.id);
  }, []);

  const handleMarkRead = async () => {
    const item = selectedNotification;
    if (!item || item.read || isBusy) return;

    setError(null);
    setIsBusy(true);

    const [, err] = await markNotificationRead(item.id);
    setIsBusy(false);

    if (err) {
      setError(err);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAll = async () => {
    if (isBusy || unreadCount === 0) return;

    setError(null);
    setIsBusy(true);

    const [, err] = await markAllNotificationsRead();
    setIsBusy(false);

    if (err) {
      setError(err);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleRefresh = async () => {
    if (isBusy || isLoading) return;
    await loadData(selectedId);
  };

  const canMarkRead =
    selectedNotification !== null && !selectedNotification.read;
  const canMarkAll = unreadCount > 0;

  return (
    <div className="notifications-page">
      <h1 className="page-title">Уведомления</h1>

      <div className="notifications-actions-bar">
        <Button
          variant="primary"
          onClick={() => handleMarkRead()}
          disabled={!canMarkRead || isBusy}
        >
          Отметить прочитанным
        </Button>

        <Button
          variant="secondary"
          onClick={handleMarkAll}
          disabled={!canMarkAll || isBusy}
        >
          Прочитать все
        </Button>

        <Button
          variant="secondary"
          onClick={handleRefresh}
          disabled={isBusy || isLoading}
        >
          Обновить
        </Button>

        <span className="notifications-counter-label">
          Непрочитанных: {unreadCount}
        </span>

        {(isBusy || isLoading) && (
          <span className="notifications-spinner" title="Загрузка..." />
        )}
      </div>

      {error && <div className="notifications-error-alert">{error}</div>}

      <div className="notifications-main-content">
        <div className="notifications-table-section">
          <NotificationsTable
            notifications={notifications}
            selectedId={selectedId}
            onSelect={handleSelectRow}
            isLoading={isLoading}
          />
        </div>

        <NotificationDetailsCard notification={selectedNotification} />
      </div>
    </div>
  );
}
