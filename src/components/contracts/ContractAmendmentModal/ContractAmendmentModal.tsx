import { useState, useEffect, type FormEvent } from "react";
import type { AmendmentInput } from "#/services/contracts";
import { requestAmendment } from "#/services/contracts";
import type { ContractKind, ContractResponse } from "#/lib/types";
import type { FieldErrors } from "#/lib/validation";
import { Modal } from "#/components/ui/Modal";
import { Button } from "#/components/ui/Button";
import { Input } from "#/components/ui/Input";
import { Textarea } from "#/components/ui/Textarea";
import "../ContractOfferModal/ContractOfferModal.css";

export interface ContractAmendmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  kind: ContractKind;
  contract: ContractResponse | null;
  onSaved: () => void;
}

export const ContractAmendmentModal = ({
  isOpen,
  onClose,
  kind,
  contract,
  onSaved,
}: ContractAmendmentModalProps) => {
  const [price, setPrice] = useState("");
  const [terms, setTerms] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors<AmendmentInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract && isOpen) {
      setPrice(contract.price ? String(contract.price) : "");
      setTerms(contract.terms || "");
      setStartDate(contract.startDate ? contract.startDate.slice(0, 10) : "");
      setEndDate(contract.endDate ? contract.endDate.slice(0, 10) : "");
      setErrors({});
    }
  }, [contract, isOpen]);

  if (!contract) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      price: price ? Number(price) : undefined,
      terms: terms || null,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const [res, err] = await requestAmendment(kind, contract.id, payload);
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
      title={`Изменение условий договора №${contract.id}`}
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
            form="contract-amend-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить запрос"}
          </Button>
        </>
      }
    >
      <form
        id="contract-amend-form"
        onSubmit={handleSubmit}
        className="contract-modal-form"
      >
        <p
          style={{
            margin: "0 0 4px 0",
            fontSize: 13,
            color: "var(--color-text-muted)",
          }}
        >
          Текущие значения подставлены. Измените нужные: вторая сторона должна
          согласиться с новыми условиями.
        </p>

        {errors.general && (
          <div className="contract-form-alert">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="amendPrice" className="form-label">
            Цена, руб.
          </label>
          <Input
            id="amendPrice"
            type="number"
            step="any"
            placeholder="Например: 50000.00"
            value={price}
            error={errors.price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="amendTerms" className="form-label">
            Условия договора
          </label>
          <Textarea
            id="amendTerms"
            rows={3}
            placeholder="Особые условия"
            value={terms}
            error={errors.terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="amendStartDate" className="form-label">
              Дата начала
            </label>
            <div className="date-input-row">
              <Input
                id="amendStartDate"
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
            <label htmlFor="amendEndDate" className="form-label">
              Дата окончания
            </label>
            <div className="date-input-row">
              <Input
                id="amendEndDate"
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
      </form>
    </Modal>
  );
};
