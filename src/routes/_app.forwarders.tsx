import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/Button";
import { ConfirmModal } from "#/components/ui/ConfirmModal";
import { Input } from "#/components/ui/Input";
import { Modal } from "#/components/ui/Modal";
import { ReportTable } from "#/components/ui/ReportTable";
import { api, type UserResponse } from "#/lib/api";
import { formatDateTime } from "#/lib/format";
import { apiError, useApiData } from "#/lib/useApiData";

export const Route = createFileRoute("/_app/forwarders")({ component: ForwardersPage });

function ForwardersPage() {
  const { data, error, loading, refresh } = useApiData(api.forwarders.list);
  const [selected, setSelected] = useState<UserResponse>();
  const [action, setAction] = useState<"create" | "delete">();
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  function open(next: "create" | "delete") {
    setActionError("");
    setAction(next);
  }

  async function save(operation: () => Promise<unknown>) {
    if (saving) return;
    setActionError("");
    setSaving(true);
    try {
      await operation();
      setAction(undefined);
      setSelected(undefined);
      refresh();
    } catch (error) {
      setActionError(apiError(error));
    } finally {
      setSaving(false);
    }
  }

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const nickname = String(fields.get("nickname")).trim();
    const password = String(fields.get("password"));
    if (password !== fields.get("confirmation")) {
      setActionError("Пароли не совпадают");
      return;
    }

    void save(() =>
      api.forwarders.create({
        nickname,
        email: String(fields.get("email")).trim(),
        password,
      }),
    );
  }

  function close() {
    if (!saving) setAction(undefined);
  }

  return (
    <section className="report-page">
      <h1>Экспедиторы</h1>
      <div className="report-actions">
        <Button onClick={() => open("create")}>Добавить</Button>
        <Button variant="danger" disabled={!selected || loading} onClick={() => open("delete")}>
          Удалить
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
          label="Экспедиторы"
          columns={["Никнейм", "Электронная почта", "Создан"]}
          rows={data.map((user) => [user.nickname, user.email, formatDateTime(user.createdAt)])}
          selected={data.findIndex((user) => user.id === selected?.id)}
          onSelect={(index) => setSelected(data[index])}
        />
      )}
      <Modal isOpen={action === "create"} onClose={close} title="Добавить экспедитора">
        <form className="report-form" onSubmit={create}>
          <div className="report-field">
            <label htmlFor="forwarder-name">Никнейм</label>
            <Input
              id="forwarder-name"
              name="nickname"
              pattern={String.raw`[\p{L}\p{N}_.\-]{3,30}`}
              title="От 3 до 30 символов: буквы, цифры, точка, дефис или подчёркивание"
              minLength={3}
              maxLength={30}
              required
              disabled={saving}
            />
          </div>
          <div className="report-field">
            <label htmlFor="forwarder-email">Электронная почта</label>
            <Input
              id="forwarder-email"
              name="email"
              type="email"
              maxLength={150}
              required
              disabled={saving}
            />
          </div>
          <div className="report-field">
            <label htmlFor="forwarder-password">Пароль</label>
            <Input
              id="forwarder-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              disabled={saving}
            />
          </div>
          <div className="report-field">
            <label htmlFor="forwarder-confirmation">Подтверждение пароля</label>
            <Input
              id="forwarder-confirmation"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              disabled={saving}
            />
          </div>
          {actionError && <p role="alert">{actionError}</p>}
          <Button type="submit" disabled={saving}>
            Создать
          </Button>
        </form>
      </Modal>
      <ConfirmModal
        isOpen={action === "delete"}
        onClose={close}
        onConfirm={() => {
          if (selected) void save(() => api.forwarders.delete(selected.id));
        }}
        title="Удалить экспедитора"
        message={actionError || "Удалить экспедитора «" + selected?.nickname + "»?"}
        confirmText="Удалить"
        isDanger
        isLoading={saving}
      />
    </section>
  );
}
