import { memo } from "react";
import type { CooperationRequestResponse } from "#/lib/types";
import { formatDateTime } from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import "./CooperationTable.css";

export interface CooperationTableProps {
  requests: CooperationRequestResponse[];
  selectedId?: number | null;
  onSelect?: (request: CooperationRequestResponse) => void;
  isLoading?: boolean;
  showCarrier?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const CooperationTable = memo(function CooperationTable({
  requests,
  selectedId,
  onSelect,
  isLoading = false,
  showCarrier = false,
  emptyMessage = "Заявок о сотрудничестве нет",
  className = "",
}: CooperationTableProps) {
  const totalCols = showCarrier ? 6 : 5;

  return (
    <div className={`cooperation-table-container ${className}`}>
      <table className="cooperation-table">
        <thead>
          <tr>
            <th style={{ width: 48 }}>№</th>
            {showCarrier && <th style={{ width: 140 }}>Перевозчик</th>}
            <th style={{ minWidth: 160 }}>Транспорт</th>
            <th style={{ minWidth: 180 }}>О себе</th>
            <th style={{ width: 120 }}>Статус</th>
            <th style={{ width: 130 }}>Создана</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="skeleton-row">
                <td>
                  <div className="skeleton-cell" style={{ width: 24 }} />
                </td>
                {showCarrier && (
                  <td>
                    <div className="skeleton-cell" style={{ width: 90 }} />
                  </td>
                )}
                <td>
                  <div className="skeleton-cell" style={{ width: "70%" }} />
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
                <td>
                  <div className="skeleton-cell" style={{ width: 90 }} />
                </td>
              </tr>
            ))
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan={totalCols} className="cooperation-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            requests.map((req) => {
              const isSelected = req.id === selectedId;
              return (
                <tr
                  key={req.id}
                  className={isSelected ? "selected" : ""}
                  onClick={() => onSelect?.(req)}
                >
                  <td className="cell-id">{req.id}</td>
                  {showCarrier && (
                    <td className="cell-carrier font-medium">
                      <span className="text-truncate" title={req.carrierNickname}>
                        {req.carrierNickname}
                      </span>
                    </td>
                  )}
                  <td className="cell-truncate">
                    <span className="text-truncate" title={req.vehicleInfo}>
                      {req.vehicleInfo}
                    </span>
                  </td>
                  <td className="cell-truncate">
                    <span className="text-truncate" title={req.description}>
                      {req.description}
                    </span>
                  </td>
                  <td className="cell-status">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="cell-created">
                    {formatDateTime(req.createdAt)}
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
