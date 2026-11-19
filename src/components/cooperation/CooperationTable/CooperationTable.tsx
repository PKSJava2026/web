import { memo, useState, type CSSProperties } from "react";
import { SortHeader } from "#/components/ui/SortHeader";
import { nextSort, sortRows, type SortState } from "#/lib/tableSort";
import type { CooperationRequestResponse } from "#/lib/types";
import { formatDateTime } from "#/lib/format";
import { COOPERATION_STATUS_LABELS } from "#/services/cooperation";
import { StatusBadge } from "#/components/ui/StatusBadge";
import "./CooperationTable.css";

type Column = "id" | "carrierNickname" | "vehicleInfo" | "description" | "status" | "createdAt";

const STATUSES = Object.keys(COOPERATION_STATUS_LABELS);

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
  const [sort, setSort] = useState<SortState<Column>>({ key: "id", descending: true });
  const sorted = sortRows(requests, (row) => {
    if (sort.key === "createdAt") return Date.parse(row.createdAt);
    if (sort.key === "status") return STATUSES.indexOf(row.status);
    return row[sort.key];
  }, sort.descending);
  const header = (key: Column, label: string, style: CSSProperties) => (
    <SortHeader label={label} style={style} descending={sort.key === key ? sort.descending : undefined}
      onClick={() => setSort((current) => nextSort(current, key))} />
  );
  const totalCols = showCarrier ? 6 : 5;

  return (
    <div className={`cooperation-table-container ${className}`}>
      <table className="cooperation-table">
        <thead>
          <tr>
            {header("id", "№", { width: 48 })}
            {showCarrier && header("carrierNickname", "Перевозчик", { width: 140 })}
            {header("vehicleInfo", "Транспорт", { minWidth: 160 })}
            {header("description", "О себе", { minWidth: 180 })}
            {header("status", "Статус", { width: 120 })}
            {header("createdAt", "Создана", { width: 130 })}
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
            sorted.map((req) => {
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
