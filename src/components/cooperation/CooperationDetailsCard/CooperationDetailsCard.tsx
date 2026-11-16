import { memo } from "react";
import type { CooperationRequestResponse } from "#/lib/types";
import { formatDateTime } from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import { Card } from "#/components/ui/Card";
import "./CooperationDetailsCard.css";

export interface CooperationDetailsCardProps {
  request: CooperationRequestResponse | null;
  showCarrier?: boolean;
  className?: string;
}

export const CooperationDetailsCard = memo(function CooperationDetailsCard({
  request,
  showCarrier = false,
  className = "",
}: CooperationDetailsCardProps) {
  return (
    <Card className={`cooperation-details-card ${className}`}>
      <h3 className="cooperation-details-title">Сведения о заявке</h3>

      {!request ? (
        <p className="cooperation-details-hint">Выберите заявку в таблице</p>
      ) : (
        <div className="cooperation-details-grid">
          <div className="detail-item">
            <span className="field-label">Номер</span>
            <span className="value-label font-bold">№{request.id}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Статус</span>
            <StatusBadge status={request.status} />
          </div>

          {showCarrier && (
            <div className="detail-item">
              <span className="field-label">Перевозчик</span>
              <span className="value-label font-medium">
                {request.carrierNickname}
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="field-label">Транспорт</span>
            <span className="value-label wrap-text">
              {request.vehicleInfo || "-"}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">О себе</span>
            <span className="value-label wrap-text">
              {request.description || "-"}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Создана</span>
            <span className="value-label">
              {formatDateTime(request.createdAt)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});
