import { memo } from "react";
import type { NotificationResponse } from "#/lib/types";
import { formatDateTime } from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import "./NotificationsTable.css";

export interface NotificationsTableProps {
  notifications: NotificationResponse[];
  selectedId?: number | null;
  onSelect?: (notification: NotificationResponse) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const NotificationsTable = memo(function NotificationsTable({
  notifications,
  selectedId,
  onSelect,
  isLoading = false,
  emptyMessage = "Уведомлений пока нет",
  className = "",
}: NotificationsTableProps) {
  return (
    <div className={`notifications-table-container ${className}`}>
      <table className="notifications-table">
        <thead>
          <tr>
            <th style={{ width: 140 }}>Дата</th>
            <th style={{ minWidth: 260 }}>Сообщение</th>
            <th style={{ width: 110 }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="skeleton-row">
                <td>
                  <div className="skeleton-cell" style={{ width: 100 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: "80%" }} />
                </td>
                <td>
                  <div
                    className="skeleton-cell"
                    style={{ width: 80, borderRadius: 12 }}
                  />
                </td>
              </tr>
            ))
          ) : notifications.length === 0 ? (
            <tr>
              <td colSpan={3} className="notifications-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            notifications.map((item) => {
              const isSelected = item.id === selectedId;
              const isUnread = !item.read;

              return (
                <tr
                  key={item.id}
                  className={`${isSelected ? "selected" : ""} ${isUnread ? "unread-row" : ""}`}
                  onClick={() => onSelect?.(item)}
                >
                  <td className="cell-date">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="cell-message">
                    <span className="text-truncate" title={item.message}>
                      {item.message}
                    </span>
                  </td>
                  <td className="cell-status">
                    <StatusBadge
                      status={item.read ? "read" : "unread"}
                      label={item.read ? "Прочитано" : "Новое"}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});
