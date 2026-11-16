import { memo } from "react";
import type { ContractResponse } from "#/lib/types";
import { formatMoney, formatDate } from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import "./ContractsTable.css";

export interface ContractsTableProps {
  contracts: ContractResponse[];
  selectedId?: number | null;
  onSelect?: (contract: ContractResponse) => void;
  isLoading?: boolean;
  isStaff?: boolean;
  counterpartyTitle?: string;
  emptyMessage?: string;
  className?: string;
}

export const ContractsTable = memo(function ContractsTable({
  contracts,
  selectedId,
  onSelect,
  isLoading = false,
  isStaff = false,
  counterpartyTitle = "Контрагент",
  emptyMessage = "Договоров пока нет",
  className = "",
}: ContractsTableProps) {
  const isDimmed = (contract: ContractResponse) =>
    contract.status === "TERMINATED" ||
    contract.status === "COMPLETED" ||
    contract.status === "REJECTED" ||
    contract.orderStatus === "DELIVERED";

  return (
    <div className={`contracts-table-container ${className}`}>
      <table className="contracts-table">
        <thead>
          <tr>
            <th style={{ width: 50 }}>№</th>
            <th style={{ width: 75 }}>Заявка</th>
            {isStaff ? (
              <th style={{ minWidth: 120 }}>{counterpartyTitle}</th>
            ) : (
              <th style={{ minWidth: 120 }}>Экспедитор</th>
            )}
            <th style={{ width: 130 }}>Цена</th>
            <th style={{ width: 140 }}>Срок</th>
            <th style={{ width: 160 }}>Статус</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="skeleton-row">
                <td>
                  <div className="skeleton-cell" style={{ width: 28 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 45 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 90 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 80 }} />
                </td>
                <td>
                  <div className="skeleton-cell" style={{ width: 90 }} />
                </td>
                <td>
                  <div
                    className="skeleton-cell"
                    style={{ width: 100, borderRadius: 12 }}
                  />
                </td>
              </tr>
            ))
          ) : contracts.length === 0 ? (
            <tr>
              <td colSpan={6} className="contracts-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            contracts.map((contract) => {
              const isSelected = contract.id === selectedId;
              const dimmed = isDimmed(contract) && !isSelected;
              return (
                <tr
                  key={contract.id}
                  className={`${isSelected ? "selected" : ""} ${dimmed ? "dimmed-row" : ""}`}
                  onClick={() => onSelect?.(contract)}
                >
                  <td className="cell-id">{contract.id}</td>
                  <td className="cell-order">№{contract.orderId}</td>
                  <td className="cell-party">
                    <span
                      className="text-truncate"
                      title={
                        isStaff
                          ? contract.counterpartyNickname
                          : contract.forwarderNickname
                      }
                    >
                      {isStaff
                        ? contract.counterpartyNickname
                        : contract.forwarderNickname}
                    </span>
                  </td>
                  <td className="cell-price font-medium">
                    {formatMoney(contract.price)}
                  </td>
                  <td className="cell-period">
                    {contract.startDate || contract.endDate
                      ? `${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}`
                      : "-"}
                  </td>
                  <td className="cell-status">
                    <StatusBadge status={contract.status} />
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
