import { useState, useEffect, type FormEvent } from "react";
import type { OrderResponse } from "#/lib/types";
import {
  createOrder,
  updateOrder,
  type OrderInput,
} from "#/services/orders";
import type { FieldErrors } from "#/lib/validation";
import { Modal } from "#/components/ui/Modal";
import { Button } from "#/components/ui/Button";
import { Input } from "#/components/ui/Input";
import { Textarea } from "#/components/ui/Textarea";
import "./OrderFormModal.css";

export interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrder?: OrderResponse | null;
  onSaved: () => void;
}

export const OrderFormModal = ({
  isOpen,
  onClose,
  initialOrder,
  onSaved,
}: OrderFormModalProps) => {
  const isEditing = Boolean(initialOrder);

  const [cargoDescription, setCargoDescription] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors<OrderInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialOrder) {
        setCargoDescription(initialOrder.cargoDescription || "");
        setOrigin(initialOrder.origin || "");
        setDestination(initialOrder.destination || "");
        setWeightKg(String(initialOrder.weightKg || ""));
        setVolumeM3(String(initialOrder.volumeM3 || ""));
        setDesiredDate(
          initialOrder.desiredDate ? initialOrder.desiredDate.slice(0, 10) : "",
        );
      } else {
        setCargoDescription("");
        setOrigin("");
        setDestination("");
        setWeightKg("");
        setVolumeM3("");
        setDesiredDate("");
      }
      setErrors({});
    }
  }, [isOpen, initialOrder]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const payload = {
      cargoDescription,
      origin,
      destination,
      weightKg: weightKg ? Number(weightKg) : undefined,
      volumeM3: volumeM3 ? Number(volumeM3) : undefined,
      desiredDate: desiredDate || null,
    };

    const [res, err] =
      isEditing && initialOrder
        ? await updateOrder(initialOrder.id, payload)
        : await createOrder(payload);

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
      title={
        isEditing
          ? `Редактирование заявки #${initialOrder?.id}`
          : "Новая заявка на перевозку"
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
          <Button type="submit" form="order-form" disabled={isSubmitting}>
            {isSubmitting
              ? "Сохранение..."
              : isEditing
                ? "Сохранить"
                : "Создать заявку"}
          </Button>
        </>
      }
    >
      <form
        id="order-form"
        onSubmit={handleSubmit}
        className="order-modal-form"
      >
        {errors.general && (
          <div className="order-form-alert">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="cargoDescription" className="form-label">
            Описание груза <span className="required">*</span>
          </label>
          <Textarea
            id="cargoDescription"
            rows={3}
            placeholder="Что необходимо перевезти"
            value={cargoDescription}
            error={errors.cargoDescription}
            onChange={(e) => setCargoDescription(e.target.value)}
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="origin" className="form-label">
              Откуда <span className="required">*</span>
            </label>
            <Input
              id="origin"
              placeholder="Город отправления"
              value={origin}
              error={errors.origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination" className="form-label">
              Куда <span className="required">*</span>
            </label>
            <Input
              id="destination"
              placeholder="Город назначения"
              value={destination}
              error={errors.destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="weightKg" className="form-label">
              Вес, кг <span className="required">*</span>
            </label>
            <Input
              id="weightKg"
              type="number"
              step="any"
              placeholder="Например: 1500"
              value={weightKg}
              error={errors.weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="volumeM3" className="form-label">
              Объем, м³ <span className="required">*</span>
            </label>
            <Input
              id="volumeM3"
              type="number"
              step="any"
              placeholder="Например: 12.5"
              value={volumeM3}
              error={errors.volumeM3}
              onChange={(e) => setVolumeM3(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="desiredDate" className="form-label">
            Желаемая дата доставки
          </label>
          <div className="date-input-row">
            <Input
              id="desiredDate"
              type="date"
              value={desiredDate}
              error={errors.desiredDate}
              onChange={(e) => setDesiredDate(e.target.value)}
            />
            {desiredDate && (
              <Button
                type="button"
                variant="link"
                className="clear-date-btn"
                onClick={() => setDesiredDate("")}
              >
                Очистить
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
