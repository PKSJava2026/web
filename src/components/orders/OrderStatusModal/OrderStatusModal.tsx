import { useState, useEffect, type FormEvent } from "react";
import type { OrderResponse, OrderStatus } from "#/lib/types";
import { changeOrderStatus, ORDER_STATUS_LABELS } from "#/services/orders";
import { Modal } from "#/components/ui/Modal";
import { Button } from "#/components/ui/Button";
import { Select } from "#/components/ui/Select";

export interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  onSaved: () => void;
}

export const OrderStatusModal = ({
  isOpen,
  onClose,
  order,
  onSaved,
}: OrderStatusModalProps) => {
  const [status, setStatus] = useState<OrderStatus>("NEW");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setError(null);
    }
  }, [order, isOpen]);

  if (!order) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const [res, err] = await changeOrderStatus(order.id, status);
    setIsSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    if (res) {
      onSaved();
      onClose();
    }
  };

  const statusOptions = (
    Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]
  ).map((key) => ({
    value: key,
    name: ORDER_STATUS_LABELS[key],
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Изменение статуса заявки №${order.id}`}
      maxWidth={420}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button type="submit" form="status-form" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Применить"}
          </Button>
        </>
      }
    >
      <form
        id="status-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--color-danger-tint)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label
            htmlFor="statusSelect"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-muted)",
            }}
          >
            Новый статус
          </label>
          <Select
            id="statusSelect"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            options={statusOptions}
          />
        </div>
      </form>
    </Modal>
  );
};
