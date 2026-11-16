import { useState, useEffect, type FormEvent } from "react";
import type { CreateCooperationInput } from "#/services/cooperation";
import { createCooperationRequest } from "#/services/cooperation";
import type { FieldErrors } from "#/lib/validation";
import { Modal } from "#/components/ui/Modal";
import { Button } from "#/components/ui/Button";
import { Textarea } from "#/components/ui/Textarea";
import "./CooperationFormModal.css";

export interface CooperationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CooperationFormModal = ({
  isOpen,
  onClose,
  onSaved,
}: CooperationFormModalProps) => {
  const [description, setDescription] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [errors, setErrors] = useState<FieldErrors<CreateCooperationInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setVehicleInfo("");
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const [res, err] = await createCooperationRequest({
      description,
      vehicleInfo,
    });

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
      title="Новая заявка о сотрудничестве"
      maxWidth={500}
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
            form="cooperation-create-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </Button>
        </>
      }
    >
      <form
        id="cooperation-create-form"
        onSubmit={handleSubmit}
        className="cooperation-modal-form"
      >
        {errors.general && (
          <div className="cooperation-form-alert">{errors.general}</div>
        )}

        <div className="form-group">
          <label htmlFor="coopDescription" className="form-label">
            О себе <span className="required">*</span>
          </label>
          <Textarea
            id="coopDescription"
            rows={4}
            placeholder="Опыт перевозок, регионы, условия работы"
            value={description}
            error={errors.description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="coopVehicleInfo" className="form-label">
            Транспорт <span className="required">*</span>
          </label>
          <Textarea
            id="coopVehicleInfo"
            rows={3}
            placeholder="Тип транспорта, грузоподъёмность, количество машин"
            value={vehicleInfo}
            error={errors.vehicleInfo}
            onChange={(e) => setVehicleInfo(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
