import { memo, type CSSProperties } from "react";
import { SortHeader } from "#/components/ui/SortHeader";
import type { SortState } from "#/lib/tableSort";
import type { OrderResponse } from "#/lib/types";
import {
  formatDate,
  formatDateTime,
} from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import "./OrdersTable.css";

export type OrderColumn = keyof Pick<OrderResponse,
  "id" | "customerNickname" | "cargoDescription" | "origin" | "destination" |
  "weightKg" | "volumeM3" | "desiredDate" | "status" | "createdAt"
>;

export interface OrdersTableProps {
  sort: SortState<OrderColumn>;
  onSort: (key: OrderColumn) => void;
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
  sort,
  onSort,
  emptyMessage = "Заявок пока нет",
  className = "",
}: OrdersTableProps) {
  const totalCols = showCustomer ? 10 : 9;
  const header = (key: OrderColumn, label: string, style: CSSProperties) => (
    <SortHeader label={label} style={style} descending={sort.key === key ? sort.descending : undefined}
      onClick={() => onSort(key)} />
  );

  return (
    <div className={`orders-table-container ${className}`}>
      <table className="orders-table">
        <thead>
          <tr>
            {header("id", "№", { width: 44 })}
            {showCustomer && header("customerNickname", "Заказчик", { width: 100 })}
            {header("cargoDescription", "Груз", { minWidth: 140 })}
            {header("origin", "Откуда", { width: 100 })}
            {header("destination", "Куда", { width: 100 })}
            {header("weightKg", "Вес, кг", { width: 75 })}
            {header("volumeM3", "Объём, м³", { width: 65 })}
            {header("desiredDate", "Желаемая дата", { width: 95 })}
            {header("status", "Статус", { width: 110 })}
            {header("createdAt", "Создана", { width: 105 })}
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
                    {order.weightKg?.toLocaleString("ru-RU", { maximumFractionDigits: 3 }) ?? "—"}
                  </td>
                  <td className="cell-volume">
                    {order.volumeM3?.toLocaleString("ru-RU", { maximumFractionDigits: 3 }) ?? "—"}
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
