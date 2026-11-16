import { memo } from "react";
import type { OrderResponse } from "#/lib/types";
import {
  formatDate,
  formatDateTime,
  formatWeight,
  formatVolume,
} from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import "./OrdersTable.css";

export interface OrdersTableProps {
  orders: OrderResponse[];
  selectedId?: number | null;
  onSelect?: (order: OrderResponse) => void;
  isLoading?: boolean;
  showCustomer?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const OrdersTable = memo(function OrdersTable({
  orders,
  selectedId,
  onSelect,
  isLoading = false,
  showCustomer = false,
  emptyMessage = "Заявок не найдено",
  className = "",
}: OrdersTableProps) {
  const totalCols = showCustomer ? 10 : 9;

  return (
    <div className={`orders-table-container ${className}`}>
      <table className="orders-table">
        <thead>
          <tr>
            <th style={{ width: 44 }}>№</th>
            {showCustomer && <th style={{ width: 100 }}>Клиент</th>}
            <th style={{ minWidth: 140 }}>Груз</th>
            <th style={{ width: 100 }}>Откуда</th>
            <th style={{ width: 100 }}>Куда</th>
            <th style={{ width: 75 }}>Вес</th>
            <th style={{ width: 65 }}>Объем</th>
            <th style={{ width: 95 }}>Желаемая дата</th>
            <th style={{ width: 110 }}>Статус</th>
            <th style={{ width: 105 }}>Создана</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="skeleton-row">
                <td>
                  <div className="skeleton-cell" style={{ width: 24 }} />
                </td>
                {showCustomer && (
                  <td>
                    <div className="skeleton-cell" style={{ width: 70 }} />
                  </td>
                )}
                <td>
                  <div className="skeleton-cell" style={{ width: "70%" }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 70 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 70 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 40 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 35 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 65 }} />
                </td>
                <td>
                  <div
                    className="skeleton-cell"
                    style={{ width: 80, borderRadius: 12 }}
                  />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 80 }} />
                </td>
              </tr>
            ))
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={totalCols} className="orders-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            orders.map((order) => {
              const isSelected = order.id === selectedId;
              return (
                <tr
                  key={order.id}
                  className={isSelected ? "selected" : ""}
                  onClick={() => onSelect?.(order)}
                >
                  <td className="cell-id">{order.id}</td>
                  {showCustomer && (
                    <td className="cell-customer">
                      <span
                        className="text-truncate"
                        title={order.customerNickname}
                      >
                        {order.customerNickname}
                      </span>
                    </td>
                  )}
                  <td className="cell-cargo">
                    <span
                      className="text-truncate"
                      title={order.cargoDescription}
                    >
                      {order.cargoDescription}
                    </span>
                  </td>
                  <td className="cell-route">
                    <span className="text-truncate" title={order.origin}>
                      {order.origin}
                    </span>
                  </td>
                  <td className="cell-route">
                    <span className="text-truncate" title={order.destination}>
                      {order.destination}
                    </span>
                  </td>
                  <td className="cell-weight">
                    {formatWeight(order.weightKg)}
                  </td>
                  <td className="cell-volume">
                    {formatVolume(order.volumeM3)}
                  </td>
                  <td className="cell-date">{formatDate(order.desiredDate)}</td>
                  <td className="cell-status">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="cell-created">
                    {formatDateTime(order.createdAt)}
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
