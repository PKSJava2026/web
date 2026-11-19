import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/Button";
import { Modal } from "#/components/ui/Modal";
import { ReportTable } from "#/components/ui/ReportTable";
import { api, type OrderResponse } from "#/lib/api";
import { formatDateTime } from "#/lib/format";
import { apiError, useApiData } from "#/lib/useApiData";
import { useAuthStore } from "#/store/useAuthStore";

export const Route = createFileRoute("/_app/rate-orders")({ component: RateOrdersPage });

function RateOrdersPage() {
  const target = useAuthStore((state) =>
    state.user?.role === "CUSTOMER" ? "экспедитора" : "перевозчика",
  );
  const { data, loading, error, refresh } = useApiData(api.ratings.unrated);
  const [selected, setSelected] = useState<OrderResponse>();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<number>();
  const [formError, setFormError] = useState("");

  function openRating(order: OrderResponse) {
    setSelected(order);
    setFormError("");
    setSavedOrderId(undefined);
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    const fields = new FormData(event.currentTarget);
    setSaving(true);
    setFormError("");
    try {
      await api.ratings.rate(selected.id, {
        score: Number(fields.get("score")),
        comment: String(fields.get("comment")).trim() || null,
      });
      setSavedOrderId(selected.id);
      setOpen(false);
      setSelected(undefined);
      refresh();
    } catch (error) {
      setFormError(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="report-page">
      <h1>
        {target === "экспедитора" ? "Оценка услуги экспедитора" : "Оценка работы перевозчика"}
      </h1>
      <p>Оценить можно только доставленную заявку, по одной оценке на заявку.</p>
      {savedOrderId !== undefined && (
        <p role="status">Оценка по заявке №{savedOrderId} сохранена</p>
      )}
      <div className="report-actions">
        <Button
          disabled={!selected || loading}
          onClick={() => {
            if (selected) openRating(selected);
          }}
        >
          Оценить
        </Button>
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => {
            setSelected(undefined);
            refresh();
          }}
        >
          Обновить
        </Button>
      </div>
      {loading && <p role="status">Загрузка…</p>}
      {error && <p role="alert">{error}</p>}
      {data && (
        <ReportTable
          label="Заявки для оценки"
          emptyMessage="Нет услуг, ожидающих оценки"
          columns={["Заявка", "Груз", "Откуда", "Куда", "Создана"]}
          rows={data.map((order) => [
            "№" + order.id,
            order.cargoDescription,
            order.origin,
            order.destination,
            formatDateTime(order.createdAt),
          ])}
          selected={data.findIndex((order) => order.id === selected?.id)}
          onSelect={(index) => setSelected(data[index])}
          onActivate={(index) => openRating(data[index])}
        />
      )}
      <Modal
        isOpen={open}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
        title={selected ? "Оценка по заявке №" + selected.id : "Оценка услуги"}
      >
        <form className="report-form" onSubmit={submit}>
          <p>
            Заявка №{selected?.id} · оценка {target}
          </p>
          <div className="report-field">
            <label htmlFor="rating-score">Оценка</label>
            <select id="rating-score" name="score" defaultValue="" required disabled={saving}>
              <option value="" disabled>
                Выберите оценку
              </option>
              {["отлично", "хорошо", "удовлетворительно", "плохо", "очень плохо"].map(
                (label, index) => (
                  <option value={5 - index} key={label}>
                    {5 - index} — {label}
                  </option>
                ),
              )}
            </select>
          </div>
          <div className="report-field">
            <label htmlFor="rating-comment">Комментарий</label>
            <textarea id="rating-comment" name="comment" maxLength={500} disabled={saving} />
          </div>
          {formError && <p role="alert">{formError}</p>}
          <Button type="submit" disabled={saving}>
            Сохранить
          </Button>
        </form>
      </Modal>
    </section>
  );
}
