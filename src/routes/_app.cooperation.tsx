import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";
import type {
  CooperationRequestResponse,
  OrderResponse,
} from "#/lib/types";
import {
  getCooperationRequests,
  cancelCooperationRequest,
  getOrdersForCooperationContract,
  canCancelCooperationRequest,
  canCreateContractFromCooperation,
} from "#/services/cooperation";
import {
  CooperationTable,
  CooperationDetailsCard,
  CooperationFormModal,
  CooperationContractModal,
} from "#/components/cooperation";
import { ConfirmModal } from "#/components/ui/ConfirmModal";
import { Button } from "#/components/ui/Button";
import "./cooperation.css";

export const Route = createFileRoute("/_app/cooperation")({
  component: CooperationPage,
});

function CooperationPage() {
  const user = useAuthStore((state) => state.user);
  const isCarrier = user?.role === "CARRIER";
  const isStaff = user?.role === "FORWARDER" || user?.role === "ADMIN";

  const [requests, setRequests] = useState<CooperationRequestResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<OrderResponse[]>([]);

  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedId) || null,
    [requests, selectedId],
  );

  const canCancel = canCancelCooperationRequest(selectedRequest, isCarrier);
  const canContract = canCreateContractFromCooperation(selectedRequest, isCarrier);

  const loadData = useCallback(async () => {
    if (!user || user.role === "CUSTOMER") return;

    setIsLoading(true);
    setError(null);

    const [data, err] = await getCooperationRequests(user.role);
    setIsLoading(false);

    if (err) {
      setError(err);
      return;
    }

    if (data) {
      setRequests(data);
      setSelectedId((prev) =>
        prev !== null && !data.some((r) => r.id === prev) ? null : prev,
      );
    }
  }, [user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectRow = useCallback(
    (request: CooperationRequestResponse) => {
      setSelectedId((prev) => (prev === request.id ? null : request.id));
    },
    [],
  );

  const handleOpenContractModal = async () => {
    if (!selectedRequest) return;
    setError(null);
    setIsActionLoading(true);

    const [orders, err] = await getOrdersForCooperationContract();
    setIsActionLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setAvailableOrders(orders || []);
    setIsContractOpen(true);
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    const [, err] = await cancelCooperationRequest(selectedRequest.id);
    setIsActionLoading(false);
    setIsCancelConfirmOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  if (user?.role === "CUSTOMER") {
    return (
      <div className="cooperation-page">
        <h1 className="page-title">Заявки о сотрудничестве</h1>
        <div style={{ color: "var(--color-text-muted)", marginTop: 16 }}>
          Раздел заявок о сотрудничестве предназначен для перевозчиков и
          экспедиторов.
        </div>
      </div>
    );
  }

  const pageTitle = isCarrier
    ? "Мои заявки о сотрудничестве"
    : "Заявки перевозчиков о сотрудничестве";

  return (
    <div className="cooperation-page">
      <h1 className="page-title">{pageTitle}</h1>

      {error && <div className="cooperation-error-alert">{error}</div>}

      <div className="cooperation-actions-bar">
        {isCarrier && (
          <>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              Создать заявку
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsCancelConfirmOpen(true)}
              disabled={!canCancel}
            >
              Отозвать заявку
            </Button>
          </>
        )}

        {isStaff && (
          <Button
            variant="primary"
            onClick={handleOpenContractModal}
            disabled={!canContract || isActionLoading}
          >
            Заключить договор
          </Button>
        )}

        <Button variant="secondary" onClick={loadData} disabled={isLoading}>
          Обновить
        </Button>
      </div>

      <div className="cooperation-main-content">
        <div className="cooperation-table-section">
          <CooperationTable
            requests={requests}
            selectedId={selectedId}
            onSelect={handleSelectRow}
            isLoading={isLoading}
            showCarrier={isStaff}
          />
          <div className="cooperation-count-label">
            Заявок: {requests.length}
          </div>
        </div>

        <CooperationDetailsCard
          request={selectedRequest}
          showCarrier={isStaff}
        />
      </div>

      {/* Modals */}
      <CooperationFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={loadData}
      />

      <CooperationContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        request={selectedRequest}
        orders={availableOrders}
        onSaved={loadData}
      />

      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelRequest}
        title="Отзыв заявки о сотрудничестве"
        message={`Отозвать заявку о сотрудничестве №${selectedRequest?.id}?`}
        confirmText="Отозвать"
        isDanger
        isLoading={isActionLoading}
      />
    </div>
  );
}
