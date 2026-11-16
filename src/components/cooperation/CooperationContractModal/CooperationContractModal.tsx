import { useState, useEffect, type FormEvent } from "react";
import type {
  CooperationRequestResponse,
  OrderResponse,
} from "#/lib/types";
import type { CooperationContractInput } from "#/services/cooperation";
import { createContractFromCooperation } from "#/services/cooperation";
import type { FieldErrors } from "#/lib/validation";
import { Modal } from "#/components/ui/Modal";
import { Button } from "#/components/ui/Button";
import { Input } from "#/components/ui/Input";
import { Select } from "#/components/ui/Select";
import { Textarea } from "#/components/ui/Textarea";
import "../CooperationFormModal/CooperationFormModal.css";

export interface CooperationContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CooperationRequestResponse | null;
  orders: OrderResponse[];
  onSaved: () => void;
}

export const CooperationContractModal = ({
  isOpen,
  onClose,
  request,
  orders,
  onSaved,
}: CooperationContractModalProps) => {
  const [orderId, setOrderId] = useState("");
  const [price, setPrice] = useState("");
  const [terms, setTerms] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors<CooperationContractInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOrderId(orders.length > 0 ? String(orders[0].id) : "");
      setPrice("");
      setTerms("");
      setStartDate("");
      setEndDate("");
      setErrors({});
    }
  }, [isOpen, orders]);

  if (!request) return null;

  const orderOptions = [
    { name: "Выберите заявку на перевозку", value: "" },
    ...orders.map((o) => ({
      name: `№${o.id} · ${o.cargoDescription.slice(0, 30)} (${o.origin} → ${o.destination})`,
      value: String(o.id),
    })),
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      orderId: Number(orderId),
      price: price ? Number(price) : (undefined as any),
      terms: terms || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const [res, err] = await createContractFromCooperation(
      request.id,
      request.carrierId,
      payload,
    );

    setIsSubmitting(false);

    if (err) {
      setErrors(err);
      return;
    }

    if (res) {
      onSaved();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Договор с перевозчиком по заявке №${request.id}`}
      maxWidth={520}
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
          <Button
            type="submit"
            form="cooperation-contract-form"
            disabled={isSubmitting || orders.length === 0}
          >
            {isSubmitting ? "Отправка..." : "Предложить договор"}
          </Button>
        </>
      }
    >
      <form
        id="cooperation-contract-form"
        onSubmit={handleSubmit}
        className="cooperation-modal-form"
      >
        {errors.general && (
          <div className="cooperation-form-alert">{errors.general}</div>
        )}

        <div className="carrier-info-box">
          <span className="form-label">Перевозчик</span>
          <span className="carrier-name">{request.carrierNickname}</span>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: "var(--color-text-muted)",
              fontSize: 13,
            }}
          >
            Нет заявок на перевозку, по которым можно заключить договор с
            перевозчиком. Нужна заявка в статусе «Договор заключён» без
            назначенного перевозчика.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="coopOrderSelect" className="form-label">
                Заявка на перевозку <span className="required">*</span>
              </label>
              <Select
                id="coopOrderSelect"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                options={orderOptions}
              />
              {errors.orderId && (
                <span className="field-error">{errors.orderId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="coopContractPrice" className="form-label">
                Цена, руб. <span className="required">*</span>
              </label>
              <Input
                id="coopContractPrice"
                type="number"
                step="any"
                placeholder="Например, 45000.50"
                value={price}
                error={errors.price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="coopContractTerms" className="form-label">
                Условия договора
              </label>
              <Textarea
                id="coopContractTerms"
                rows={3}
                placeholder="Особые условия (необязательно)"
                value={terms}
                error={errors.terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="coopContractStart" className="form-label">
                  Дата начала
                </label>
                <div className="date-input-row">
                  <Input
                    id="coopContractStart"
                    type="date"
                    value={startDate}
                    error={errors.startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  {startDate && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setStartDate("")}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="coopContractEnd" className="form-label">
                  Дата окончания
                </label>
                <div className="date-input-row">
                  <Input
                    id="coopContractEnd"
                    type="date"
                    value={endDate}
                    error={errors.endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {endDate && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setEndDate("")}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
