import type {
  OrderStatus,
  ContractStatus,
  ChangeRequestStatus,
} from "#/lib/types";
import { ORDER_STATUS_LABELS } from "#/services/orders";
import {
  CONTRACT_STATUS_LABELS,
  CHANGE_REQUEST_STATUS_LABELS,
} from "#/services/contracts";
import "./StatusBadge.css";

const ALL_STATUS_LABELS: Record<string, string> = {
  ...ORDER_STATUS_LABELS,
  ...CONTRACT_STATUS_LABELS,
  ...CHANGE_REQUEST_STATUS_LABELS,
};

export interface StatusBadgeProps {
  status: OrderStatus | ContractStatus | ChangeRequestStatus | string;
  label?: string;
  className?: string;
}

export const StatusBadge = ({
  status,
  label,
  className = "",
}: StatusBadgeProps) => {
  const displayLabel = label ?? ALL_STATUS_LABELS[status] ?? status;
  const statusClass = `status-${status.toLowerCase().replace(/_/g, "-")}`;

  return (
    <span className={`status-badge ${statusClass} ${className}`}>
      {displayLabel}
    </span>
  );
};
