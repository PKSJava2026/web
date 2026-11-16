import { useState, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";
import type {
  OrderResponse,
  OrderSearchParams,
  OrderSort,
  OrderStatus,
} from "#/lib/types";
import {
  getOrders,
  cancelOrder,
  deleteOrder,
  downloadOrdersExport,
  ORDER_STATUS_LABELS,
  ORDER_SORT_LABELS,
} from "#/services/orders";
import {
  OrdersTable,
  OrderDetailsCard,
  OrderFormModal,
  OrderStatusModal,
} from "#/components/orders";
import { ConfirmModal } from "#/components/ui/ConfirmModal";
import { Button } from "#/components/ui/Button";
import { Input } from "#/components/ui/Input";
import { Select } from "#/components/ui/Select";
import { Checkbox } from "#/components/ui/Checkbox";
import "./requests.css";

export const Route = createFileRoute("/_app/requests")({
  component: RequestsPage,
});

function RequestsPage() {
  const user = useAuthStore((state) => state.user);
  const isCustomer = user?.role === "CUSTOMER";
  const isForwarder = user?.role === "FORWARDER" || user?.role === "ADMIN";

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortBy, setSortBy] = useState<OrderSort | "">("");
  const [isDesc, setIsDesc] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedId) || null;

  const fetchOrders = useCallback(async () => {
    if (!user || user.role === "CARRIER") return;

    setIsLoading(true);
    setError(null);

    const params: OrderSearchParams = {
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(dateFrom ? { from: dateFrom } : {}),
      ...(dateTo ? { to: dateTo } : {}),
      ...(activeOnly ? { active: true } : {}),
      ...(sortBy ? { sort: sortBy } : {}),
      desc: isDesc,
    };

    const [data, err] = await getOrders(user?.role, params);
    setIsLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (data) {
      setOrders(data);
      setSelectedId((prev) =>
        prev !== null && !data.some((o) => o.id === prev) ? null : prev,
      );
    }
  }, [
    user?.role,
    searchQuery,
    statusFilter,
    dateFrom,
    dateTo,
    activeOnly,
    sortBy,
    isDesc,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setActiveOnly(false);
    setSortBy("");
    setIsDesc(false);
  };

  const handleRowSelect = useCallback((order: OrderResponse) => {
    setSelectedId((prev) => (prev === order.id ? null : order.id));
  }, []);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setIsActionLoading(true);
    const [, err] = await cancelOrder(selectedOrder.id);
    setIsActionLoading(false);
    setIsCancelConfirmOpen(false);

    if (err) {
      setError(err);
    } else {
      fetchOrders();
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    setIsActionLoading(true);
    const [, err] = await deleteOrder(selectedOrder.id);
    setIsActionLoading(false);
    setIsDeleteConfirmOpen(false);

    if (err) {
      setError(err);
    } else {
      setSelectedId(null);
      fetchOrders();
    }
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    const [, err] = await downloadOrdersExport(format);
    if (err) {
      setError(err);
    }
  };

  const statusOptions = [
    { name: "Все статусы", value: "" },
    ...(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((key) => ({
      name: ORDER_STATUS_LABELS[key],
      value: key,
    })),
  ];

  const sortOptions = [
    { name: "Сортировка", value: "" },
    ...(Object.keys(ORDER_SORT_LABELS) as OrderSort[]).map((key) => ({
      name: ORDER_SORT_LABELS[key],
      value: key,
    })),
  ];

  const canEdit = isCustomer && selectedOrder?.status === "NEW";
  const canCancel = isCustomer && selectedOrder?.status === "NEW";
  const canDelete =
    isCustomer &&
    (selectedOrder?.status === "NEW" || selectedOrder?.status === "CANCELLED");
  const canChangeStatus = isForwarder && Boolean(selectedOrder);

  if (user?.role === "CARRIER") {
    return (
      <div className="requests-page">
        <h1 className="page-title">Заявки на перевозку</h1>
        <div style={{ color: "var(--color-text-muted)", marginTop: 16 }}>
          Раздел заявок доступен только заказчикам и экспедиторам. Для работы с
          перевозками перейдите в раздел «Договоры».
        </div>
      </div>
    );
  }

  return (
    <div className="requests-page">
      <h1 className="page-title">Заявки на перевозку</h1>

      {error && <div className="requests-error-alert">{error}</div>}

      <div className="requests-actions-bar">
        {isCustomer && (
          <>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              Добавить
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsEditOpen(true)}
              disabled={!canEdit}
            >
              Изменить
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsCancelConfirmOpen(true)}
              disabled={!canCancel}
            >
              Отменить заявку
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={!canDelete}
            >
              Удалить
            </Button>
          </>
        )}

        {isForwarder && (
          <Button
            variant="primary"
            onClick={() => setIsStatusOpen(true)}
            disabled={!canChangeStatus}
          >
            Изменить статус
          </Button>
        )}

        <Checkbox
          label="Только актуальные"
          checked={activeOnly}
          onChange={(e) => setActiveOnly(e.target.checked)}
        />

        <Button variant="secondary" onClick={fetchOrders} disabled={isLoading}>
          Обновить
        </Button>

        <Button variant="secondary" onClick={() => handleExport("csv")}>
          Экспорт CSV
        </Button>
        <Button variant="secondary" onClick={() => handleExport("xlsx")}>
          Экспорт Excel
        </Button>
      </div>

      <div className="requests-filter-bar">
        <Input
          placeholder="Поиск: груз, откуда, куда"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 220 }}
        />

        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter((e.target.value as OrderStatus) || "")
          }
          options={statusOptions}
          style={{ width: 160 }}
        />

        <div className="requests-date-group">
          <span className="requests-date-label">Создана с</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ width: 125 }}
          />
          {dateFrom && (
            <Button
              type="button"
              variant="link"
              onClick={() => setDateFrom("")}
              title="Очистить дату"
            >
              ×
            </Button>
          )}

          <span className="requests-date-label">по</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ width: 125 }}
          />
          {dateTo && (
            <Button
              type="button"
              variant="link"
              onClick={() => setDateTo("")}
              title="Очистить дату"
            >
              ×
            </Button>
          )}
        </div>

        <Select
          value={sortBy}
          onChange={(e) => setSortBy((e.target.value as OrderSort) || "")}
          options={sortOptions}
          style={{ width: 150 }}
        />

        <Button
          variant="secondary"
          onClick={() => setIsDesc(!isDesc)}
          title="Направление сортировки"
        >
          {isDesc ? "По убыванию" : "По возрастанию"}
        </Button>

        <Button variant="secondary" onClick={handleResetFilters}>
          Сбросить
        </Button>
      </div>

      <div className="requests-main-content">
        <div className="requests-table-section">
          <OrdersTable
            orders={orders}
            selectedId={selectedId}
            onSelect={handleRowSelect}
            isLoading={isLoading}
            showCustomer={isForwarder}
          />
        </div>

        <OrderDetailsCard order={selectedOrder} showCustomer={isForwarder} />
      </div>

      <OrderFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={fetchOrders}
      />

      <OrderFormModal
        isOpen={isEditOpen}
        initialOrder={selectedOrder}
        onClose={() => setIsEditOpen(false)}
        onSaved={fetchOrders}
      />

      <OrderStatusModal
        isOpen={isStatusOpen}
        order={selectedOrder}
        onClose={() => setIsStatusOpen(false)}
        onSaved={fetchOrders}
      />

      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelOrder}
        title="Отмена заявки"
        message={`Вы действительно хотите отменить заявку №${selectedOrder?.id}?`}
        confirmText="Отменить заявку"
        isDanger
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteOrder}
        title="Удаление заявки"
        message={`Вы действительно хотите удалить заявку №${selectedOrder?.id}? Это действие необратимо.`}
        confirmText="Удалить"
        isDanger
        isLoading={isActionLoading}
      />
    </div>
  );
}
