import { memo } from "react";
import type { OrderResponse } from "#/lib/types";
import {
  formatDate,
  formatDateTime,
  formatWeight,
  formatVolume,
} from "#/lib/format";
import { StatusBadge } from "#/components/ui/StatusBadge";
import { Card } from "#/components/ui/Card";
import "./OrderDetailsCard.css";

export interface OrderDetailsCardProps {
  order: OrderResponse | null;
  showCustomer?: boolean;
}

export const OrderDetailsCard = memo(function OrderDetailsCard({
  order,
  showCustomer = false,
}: OrderDetailsCardProps) {
  return (
    <Card className="order-details-card">
      <h3 className="order-details-title">Сведения о заявке</h3>

      {!order ? (
        <p className="order-details-hint">Выберите заявку в таблице</p>
      ) : (
        <div className="order-details-grid">
          <div className="detail-item">
            <span className="field-label">Номер</span>
            <span className="value-label font-bold">№{order.id}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Статус</span>
            <StatusBadge status={order.status} />
          </div>

          {showCustomer && (
            <div className="detail-item">
              <span className="field-label">Заказчик</span>
              <span className="value-label font-medium">
                {order.customerNickname}
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="field-label">Груз</span>
            <span className="value-label wrap-text">
              {order.cargoDescription}
            </span>
          </div>

          <div className="detail-item">
            <span className="field-label">Откуда</span>
            <span className="value-label">{order.origin}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Куда</span>
            <span className="value-label">{order.destination}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Вес</span>
            <span className="value-label">{formatWeight(order.weightKg)}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Объём</span>
            <span className="value-label">{formatVolume(order.volumeM3)}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Желаемая дата</span>
            <span className="value-label">{formatDate(order.desiredDate)}</span>
          </div>

          <div className="detail-item">
            <span className="field-label">Создана</span>
            <span className="value-label">
              {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});
