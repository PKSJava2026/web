import { useState, useEffect, type FormEvent } from "react";
import type { ContractInput } from "#/services/contracts";
import { createContract } from "#/services/contracts";
import type { ContractKind, OrderResponse, UserResponse } from "#/lib/types";
import type { FieldErrors } from "#/lib/validation";
import { Modal } from "#/components/ui/Modal";
import { Button } from "#/components/ui/Button";
import { Input } from "#/components/ui/Input";
import { Select } from "#/components/ui/Select";
import { Textarea } from "#/components/ui/Textarea";
import "./ContractOfferModal.css";

export interface ContractOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: ContractKind;
  counterparties: UserResponse[];
  orders: OrderResponse[];
  onSaved: () => void;
}

export const ContractOfferModal = ({
  isOpen,
  onClose,
  kind,
  counterparties,
  orders,
  onSaved,
}: ContractOfferModalProps) => {
  const [orderId, setOrderId] = useState<string>("");
  const [counterpartyId, setCounterpartyId] = useState<string>("");
  const [price, setPrice] = useState("");
  const [terms, setTerms] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors<ContractInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOrderId(orders.length > 0 ? String(orders[0].id) : "");
      setCounterpartyId(
        counterparties.length > 0 ? String(counterparties[0].id) : "",
      );
      setPrice("");
      setTerms("");
      setStartDate("");
      setEndDate("");
      setErrors({});
    }
  }, [isOpen, orders, counterparties]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      orderId: orderId ? Number(orderId) : undefined,
      counterpartyId: counterpartyId ? Number(counterpartyId) : undefined,
      price: price ? Number(price) : undefined,
      terms: terms || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const [res, err] = await createContract(kind, payload);
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

  const counterpartyLabel =
    kind === "CUSTOMER" ? "Заказчик" : "Перевозчик";

  const counterpartyOptions = [
    { name: `Выберите (${counterpartyLabel.toLowerCase()})`, value: "" },
    ...counterparties.map((u) => ({
      name: `${u.nickname} (${u.email})`,
      value: String(u.id),
    })),
  ];

  const orderOptions = [
    { name: "Выберите заявку", value: "" },
    ...orders.map((o) => ({
      name: `№${o.id}: ${o.cargoDescription.slice(0, 30)} (${o.origin} → ${o.destination})`,
      value: String(o.id),
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        kind === "CUSTOMER"
          ? "Предложить договор заказчику"
          : "Предложить договор перевозчику"
      }
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
            form="contract-offer-form"
            disabled={isSubmitting || orders.length === 0}
          >
            {isSubmitting ? "Отправка..." : "Предложить договор"}
          </Button>
        </>
      }
    >
      <form
        id="contract-offer-form"
        onSubmit={handleSubmit}
        className="contract-modal-form"
      >
        {errors.general && (
          <div className="contract-form-alert">{errors.general}</div>
        )}

        {orders.length === 0 ? (
          <div className="contract-empty-hint">
            Нет доступных заявок для заключения договора этого типа.
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="counterpartySelect" className="form-label">
                {counterpartyLabel} <span className="required">*</span>
              </label>
              <Select
                id="counterpartySelect"
                value={counterpartyId}
                onChange={(e) => setCounterpartyId(e.target.value)}
                options={counterpartyOptions}
              />
              {errors.counterpartyId && (
                <span className="field-error">{errors.counterpartyId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="orderSelect" className="form-label">
                Заявка на перевозку <span className="required">*</span>
              </label>
              <Select
                id="orderSelect"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                options={orderOptions}
              />
              {errors.orderId && (
                <span className="field-error">{errors.orderId}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="priceInput" className="form-label">
                Цена, руб. <span className="required">*</span>
              </label>
              <Input
                id="priceInput"
                type="number"
                step="any"
                placeholder="Например: 45000.50"
                value={price}
                error={errors.price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="termsInput" className="form-label">
                Условия договора
              </label>
              <Textarea
                id="termsInput"
                rows={3}
                placeholder="Особые условия, требования к транспорту и оплате (необязательно)"
                value={terms}
                error={errors.terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="startDateInput" className="form-label">
                  Дата начала
                </label>
                <div className="date-input-row">
                  <Input
                    id="startDateInput"
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
                <label htmlFor="endDateInput" className="form-label">
                  Дата окончания
                </label>
                <div className="date-input-row">
                  <Input
                    id="endDateInput"
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
