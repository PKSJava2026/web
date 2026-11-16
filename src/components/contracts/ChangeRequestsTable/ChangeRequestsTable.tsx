import { memo } from "react";
import type { ChangeRequestResponse } from "#/lib/types";
import { formatMoney, formatDate, formatDateTime } from "#/lib/format";
import { CHANGE_REQUEST_TYPE_LABELS } from "#/services/contracts";
import "./ChangeRequestsTable.css";

export interface ChangeRequestsTableProps {
  requests: ChangeRequestResponse[];
  selectedId?: number | null;
  onSelect?: (request: ChangeRequestResponse) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const formatProposal = (request: ChangeRequestResponse): string => {
  if (request.type === "TERMINATE") {
    return "Расторгнуть договор";
  }

  const parts: string[] = [];
  if (request.proposedPrice !== null && request.proposedPrice !== undefined) {
    parts.push(`цена ${formatMoney(request.proposedPrice)}`);
  }
  if (request.proposedTerms) {
    parts.push(`условия: ${request.proposedTerms}`);
  }
  if (request.proposedStartDate) {
    parts.push(`начало ${formatDate(request.proposedStartDate)}`);
  }
  if (request.proposedEndDate) {
    parts.push(`окончание ${formatDate(request.proposedEndDate)}`);
  }

  return parts.length > 0 ? parts.join("; ") : "Без изменений";
};

export const ChangeRequestsTable = memo(function ChangeRequestsTable({
  requests,
  selectedId,
  onSelect,
  isLoading = false,
  emptyMessage = "Открытых запросов нет",
  className = "",
}: ChangeRequestsTableProps) {
  return (
    <div className={`change-requests-table-container ${className}`}>
      <table className="change-requests-table">
        <thead>
          <tr>
            <th style={{ width: 45 }}>№</th>
            <th style={{ width: 75 }}>Договор</th>
            <th style={{ width: 110 }}>Тип</th>
            <th style={{ width: 110 }}>Автор</th>
            <th style={{ minWidth: 200 }}>Предложение</th>
            <th style={{ width: 130 }}>Создан</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="skeleton-row">
                <td>
                  <div className="skeleton-cell" style={{ width: 24 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 45 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 75 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 75 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: "70%" }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 90 }} />
                </td>
              </tr>
            ))
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan={6} className="change-requests-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            requests.map((req) => {
              const isSelected = req.id === selectedId;
              const isTerminate = req.type === "TERMINATE";
              return (
                <tr
                  key={req.id}
                  className={isSelected ? "selected" : ""}
                  onClick={() => onSelect?.(req)}
                >
                  <td className="cell-id">{req.id}</td>
                  <td className="cell-contract">№{req.contractId}</td>
                  <td className="cell-type">
                    <span
                      className={`type-badge ${isTerminate ? "type-terminate" : "type-amend"}`}
                    >
                      {CHANGE_REQUEST_TYPE_LABELS[req.type]}
                    </span>
                  </td>
                  <td className="cell-initiator font-medium">
                    {req.initiatorNickname}
                  </td>
                  <td className="cell-proposal">
                    <span
                      className="text-truncate"
                      title={formatProposal(req)}
                    >
                      {formatProposal(req)}
                    </span>
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
