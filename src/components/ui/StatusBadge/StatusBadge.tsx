import type { OrderStatus } from "#/lib/types";
import { ORDER_STATUS_LABELS } from "#/services/orders";
import "./StatusBadge.css";

export interface StatusBadgeProps {
  status: OrderStatus | string;
  label?: string;
  className?: string;
}

export const StatusBadge = ({
  status,
  label,
  className = "",
}: StatusBadgeProps) => {
  const displayLabel =
    label ?? ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
  const statusClass = `status-${status.toLowerCase().replace(/_/g, "-")}`;

  return (
    <span className={`status-badge ${statusClass} ${className}`}>
      {displayLabel}
    </span>
  );
};
