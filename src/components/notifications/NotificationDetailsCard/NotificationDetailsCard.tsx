import { memo } from "react";
import type { NotificationResponse } from "#/lib/types";
import { formatDateTime } from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import { Card } from "#/components/ui/Card";
import "./NotificationDetailsCard.css";

export interface NotificationDetailsCardProps {
  notification: NotificationResponse | null;
  className?: string;
}

export const NotificationDetailsCard = memo(function NotificationDetailsCard({
  notification,
  className = "",
}: NotificationDetailsCardProps) {
  return (
    <Card className={`notification-details-card ${className}`}>
      <h3 className="notification-details-title">Сообщение</h3>

      {!notification ? (
        <p className="notification-details-hint">
          Выберите уведомление в таблице
        </p>
      ) : (
        <div className="notification-details-grid">
          <div className="detail-item">
            <span className="field-label">Дата</span>
            <span className="value-label">
              {formatDateTime(notification.createdAt)}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Статус</span>
            <StatusBadge
              status={notification.read ? "read" : "unread"}
              label={notification.read ? "Прочитано" : "Новое"}
            />
          </div>

          <div className="detail-item">
            <span className="field-label">Текст</span>
            <span className="value-label wrap-text">
              {notification.message || "-"}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});
