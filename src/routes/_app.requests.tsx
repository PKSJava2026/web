import { useState, useEffect, useCallback, useRef } from "react";
import { nextSort, sortRows, type SortState } from "#/lib/tableSort";
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
  type OrderColumn,
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

const DEFAULT_SORT: SortState<OrderColumn> = { key: "id", descending: true };
const SORT_COLUMNS: Record<OrderSort, OrderColumn> = {
  DATE: "createdAt", STATUS: "status", WEIGHT: "weightKg",
};
const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);

function RequestsPage() {
  const user = useAuthStore((state) => state.user);
  const isCustomer = user?.role === "CUSTOMER";
  const isForwarder = user?.role === "FORWARDER" || user?.role === "ADMIN";

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const sortBy = (Object.keys(SORT_COLUMNS) as OrderSort[]).find((key) => SORT_COLUMNS[key] === sort.key) ?? "";
  const sortedOrders = sortRows(orders, (order) => {
    if (sort.key === "status") return ORDER_STATUSES.indexOf(order.status);
    if (sort.key === "createdAt") return Date.parse(order.createdAt);
    return order[sort.key];
  }, sort.descending);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedId) || null;

  const fetchOrders = useCallback(async () => {
    if (!user || user.role === "CARRIER") return;

    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);

    const params: OrderSearchParams = {
      ...(searchQuery ? { q: searchQuery } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(dateFrom ? { from: dateFrom } : {}),
      ...(dateTo ? { to: dateTo } : {}),
      ...(activeOnly ? { active: true } : {}),
    };

    const [data, err] = await getOrders(user?.role, params);
    if (id !== requestId.current) return;
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
  ]);

  useEffect(() => {
    fetchOrders();
    return () => { requestId.current++; };
  }, [fetchOrders]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setActiveOnly(false);
    setSort(DEFAULT_SORT);
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
    const [, err] = await downloadOrdersExport(format, sortedOrders, !isCustomer);
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
        <h1 className="page-title">{isCustomer ? "Мои заявки" : "Заявки на перевозку"}</h1>
        <div style={{ color: "var(--color-text-muted)", marginTop: 16 }}>
          Раздел заявок доступен только заказчикам и экспедиторам. Для работы с
          перевозками перейдите в раздел «Договоры».
        </div>
      </div>
    );
  }

  return (
    <div className="requests-page">
      <h1 className="page-title">{isCustomer ? "Мои заявки" : "Заявки на перевозку"}</h1>

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

        <Button variant="secondary" disabled={isLoading || !orders.length} onClick={() => handleExport("csv")}>
          Экспорт CSV
        </Button>
        <Button variant="secondary" disabled={isLoading || !orders.length} onClick={() => handleExport("xlsx")}>
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
          onChange={(e) => setSort(e.target.value ? { key: SORT_COLUMNS[e.target.value as OrderSort], descending: sort.descending } : DEFAULT_SORT)}
          options={sortOptions}
          style={{ width: 150 }}
        />

        <Button
          variant="secondary"
          onClick={() => setSort((current) => nextSort(current, current.key))}
          title="Направление сортировки"
        >
          {sort.descending ? "По убыванию" : "По возрастанию"}
        </Button>

        <Button variant="secondary" onClick={handleResetFilters}>
          Сбросить
        </Button>
      </div>

      <div className="requests-main-content">
        <div className="requests-table-section">
          <OrdersTable
            orders={sortedOrders}
            sort={sort}
            onSort={(key) => setSort((current) => nextSort(current, key))}
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
