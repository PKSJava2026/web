import { memo } from "react";
import type { ContractResponse } from "#/lib/types";
import { formatMoney, formatDate, formatDateTime } from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import { Card } from "#/components/ui/Card";
import "./ContractDetailsCard.css";

export interface ContractDetailsCardProps {
  contract: ContractResponse | null;
  counterpartyTitle?: string;
}

export const ContractDetailsCard = memo(function ContractDetailsCard({
  contract,
  counterpartyTitle = "Контрагент",
}: ContractDetailsCardProps) {
  return (
    <Card className="contract-details-card">
      <h3 className="contract-details-title">Сведения о договоре</h3>

      {!contract ? (
        <p className="contract-details-hint">Выберите договор в таблице</p>
      ) : (
        <div className="contract-details-grid">
          <div className="detail-item">
            <span className="field-label">Номер</span>
            <span className="value-label font-bold">№{contract.id}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Статус</span>
            <StatusBadge status={contract.status} />
          </div>

          <div className="detail-item">
            <span className="field-label">Заявка</span>
            <span className="value-label font-medium">№{contract.orderId}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">{counterpartyTitle}</span>
            <span className="value-label font-medium">
              {contract.counterpartyNickname}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Экспедитор</span>
            <span className="value-label font-medium">
              {contract.forwarderNickname}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Цена</span>
            <span className="value-label font-bold">
              {formatMoney(contract.price)}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Срок</span>
            <span className="value-label">
              {contract.startDate || contract.endDate
                ? `${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}`
                : "-"}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Условия</span>
            <span className="value-label wrap-text">
              {contract.terms || "-"}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Создан</span>
            <span className="value-label">
              {formatDateTime(contract.createdAt)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});
