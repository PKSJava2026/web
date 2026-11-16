import { useState, useEffect, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "#/store/useAuthStore";
import type {
  ChangeRequestResponse,
  ContractKind,
  ContractResponse,
  OrderResponse,
  UserResponse,
} from "#/lib/types";
import {
  getContracts,
  getOpenRequests,
  acceptContract,
  rejectContract,
  requestTermination,
  acceptChangeRequest,
  rejectChangeRequest,
  cancelChangeRequest,
  getCounterparties,
  getOrdersForOffer,
  canRespondToContract,
  canChangeContract,
  canRespondToRequest,
  canCancelRequest,
  CONTRACT_KIND_LABELS,
} from "#/services/contracts";
import { Tabs, type TabItem } from "#/components/ui/Tabs";
import {
  ContractsTable,
  ContractDetailsCard,
  ChangeRequestsTable,
  ContractOfferModal,
  ContractAmendmentModal,
} from "#/components/contracts";
import { ConfirmModal } from "#/components/ui/ConfirmModal";
import { Button } from "#/components/ui/Button";
import { formatMoney } from "#/lib/format";
import "./contracts.css";

export const Route = createFileRoute("/_app/contracts")({
  component: ContractsPage,
});

function ContractsPage() {
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === "FORWARDER" || user?.role === "ADMIN";
  const defaultKind: ContractKind =
    user?.role === "CARRIER" ? "CARRIER" : "CUSTOMER";

  const [activeKind, setActiveKind] = useState<ContractKind>(defaultKind);

  useEffect(() => {
    if (user?.role === "CARRIER") {
      setActiveKind("CARRIER");
    } else if (user?.role === "CUSTOMER") {
      setActiveKind("CUSTOMER");
    }
  }, [user?.role]);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null,
  );
  const [openRequests, setOpenRequests] = useState<ChangeRequestResponse[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

  const [counterparties, setCounterparties] = useState<UserResponse[]>([]);
  const [ordersForOffer, setOrdersForOffer] = useState<OrderResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [isAcceptContractOpen, setIsAcceptContractOpen] = useState(false);
  const [isRejectContractOpen, setIsRejectContractOpen] = useState(false);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [isAcceptRequestOpen, setIsAcceptRequestOpen] = useState(false);
  const [isRejectRequestOpen, setIsRejectRequestOpen] = useState(false);
  const [isCancelRequestOpen, setIsCancelRequestOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === selectedContractId) || null,
    [contracts, selectedContractId],
  );

  const selectedRequest = useMemo(
    () => openRequests.find((r) => r.id === selectedRequestId) || null,
    [openRequests, selectedRequestId],
  );

  const matchingContractForRequest = useMemo(
    () => contracts.find((c) => c.id === selectedRequest?.contractId) || null,
    [contracts, selectedRequest?.contractId],
  );

  const loadData = useCallback(async () => {
    if (!user) return;
    if (user.role === "CARRIER" && activeKind !== "CARRIER") return;
    if (user.role === "CUSTOMER" && activeKind !== "CUSTOMER") return;

    setIsLoading(true);
    setError(null);

    const [contractsRes, contractsErr] = await getContracts(
      activeKind,
      user?.role,
    );
    const [requestsRes, requestsErr] = await getOpenRequests(activeKind);

    setIsLoading(false);

    if (contractsErr) {
      setError(contractsErr);
      return;
    }
    if (requestsErr) {
      setError(requestsErr);
      return;
    }

    if (contractsRes) {
      setContracts(contractsRes);
      setSelectedContractId((prev) =>
        prev !== null && !contractsRes.some((c) => c.id === prev) ? null : prev,
      );
    }

    if (requestsRes) {
      setOpenRequests(requestsRes);
      setSelectedRequestId((prev) =>
        prev !== null && !requestsRes.some((r) => r.id === prev) ? null : prev,
      );
    }
  }, [activeKind, user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenOffer = async () => {
    setError(null);
    const [users, uErr] = await getCounterparties(activeKind);
    const [ords, oErr] = await getOrdersForOffer(activeKind, contracts);

    if (uErr) {
      setError(uErr);
      return;
    }
    if (oErr) {
      setError(oErr);
      return;
    }

    setCounterparties(users || []);
    setOrdersForOffer(ords || []);
    setIsOfferOpen(true);
  };

  // Contract actions
  const handleAcceptContract = async () => {
    if (!selectedContract) return;
    setIsActionLoading(true);
    const [, err] = await acceptContract(activeKind, selectedContract.id);
    setIsActionLoading(false);
    setIsAcceptContractOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  const handleRejectContract = async () => {
    if (!selectedContract) return;
    setIsActionLoading(true);
    const [, err] = await rejectContract(activeKind, selectedContract.id);
    setIsActionLoading(false);
    setIsRejectContractOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  const handleTerminateContract = async () => {
    if (!selectedContract) return;
    setIsActionLoading(true);
    const [, err] = await requestTermination(activeKind, selectedContract.id);
    setIsActionLoading(false);
    setIsTerminateOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  // Change request actions
  const handleAcceptRequest = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    const [, err] = await acceptChangeRequest(activeKind, selectedRequest.id);
    setIsActionLoading(false);
    setIsAcceptRequestOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    const [, err] = await rejectChangeRequest(activeKind, selectedRequest.id);
    setIsActionLoading(false);
    setIsRejectRequestOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    setIsActionLoading(true);
    const [, err] = await cancelChangeRequest(activeKind, selectedRequest.id);
    setIsActionLoading(false);
    setIsCancelRequestOpen(false);

    if (err) {
      setError(err);
    } else {
      loadData();
    }
  };

  const handleSelectContract = useCallback((c: ContractResponse) => {
    setSelectedContractId((prev) => (prev === c.id ? null : c.id));
  }, []);

  const handleSelectRequest = useCallback((r: ChangeRequestResponse) => {
    setSelectedRequestId((prev) => (prev === r.id ? null : r.id));
  }, []);

  // Tabs for staff
  const staffTabs: TabItem<ContractKind>[] = [
    {
      id: "CUSTOMER",
      label: "С заказчиками",
    },
    {
      id: "CARRIER",
      label: "С перевозчиками",
    },
  ];

  const counterpartyTitle = CONTRACT_KIND_LABELS[activeKind].counterparty;

  const canAccept = canRespondToContract(selectedContract, user?.id, isStaff);
  const canReject = canRespondToContract(selectedContract, user?.id, isStaff);
  const canChange = canChangeContract(selectedContract, openRequests);

  const canAcceptReq = canRespondToRequest(
    selectedRequest,
    matchingContractForRequest,
    user?.id,
    isStaff,
  );
  const canRejectReq = canRespondToRequest(
    selectedRequest,
    matchingContractForRequest,
    user?.id,
    isStaff,
  );
  const canCancelReq = canCancelRequest(selectedRequest, user?.id);

  return (
    <div className="contracts-page">
      <h1 className="page-title">Договоры</h1>

      {error && <div className="contracts-error-alert">{error}</div>}

      {isStaff && (
        <Tabs
          tabs={staffTabs}
          activeTab={activeKind}
          onChange={(tab) => {
            setActiveKind(tab);
            setSelectedContractId(null);
            setSelectedRequestId(null);
          }}
        />
      )}

      {/* Contracts Actions Bar */}
      <div className="contracts-actions-bar">
        {isStaff && (
          <Button variant="primary" onClick={handleOpenOffer}>
            Предложить договор
          </Button>
        )}

        {!isStaff && (
          <>
            <Button
              variant="primary"
              onClick={() => setIsAcceptContractOpen(true)}
              disabled={!canAccept}
            >
              Подтвердить
            </Button>
            <Button
              variant="danger"
              onClick={() => setIsRejectContractOpen(true)}
              disabled={!canReject}
            >
              Отклонить
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          onClick={() => setIsAmendOpen(true)}
          disabled={!canChange}
        >
          Изменить условия
        </Button>

        <Button
          variant="danger"
          onClick={() => setIsTerminateOpen(true)}
          disabled={!canChange}
        >
          Расторгнуть
        </Button>

        <Button variant="secondary" onClick={loadData} disabled={isLoading}>
          Обновить
        </Button>
      </div>

      {/* Main Content (Table + Details) */}
      <div className="contracts-main-content">
        <div className="contracts-table-section">
          <ContractsTable
            contracts={contracts}
            selectedId={selectedContractId}
            onSelect={handleSelectContract}
            isLoading={isLoading}
            isStaff={isStaff}
            counterpartyTitle={counterpartyTitle}
          />
        </div>

        <ContractDetailsCard
          contract={selectedContract}
          counterpartyTitle={counterpartyTitle}
        />
      </div>

      {/* Open Change Requests Section */}
      <div className="contracts-requests-section">
        <h2 className="contracts-section-title">
          Открытые запросы на изменение и расторжение
        </h2>

        <div className="contracts-actions-bar">
          <Button
            variant="primary"
            onClick={() => setIsAcceptRequestOpen(true)}
            disabled={!canAcceptReq}
          >
            Принять запрос
          </Button>
          <Button
            variant="danger"
            onClick={() => setIsRejectRequestOpen(true)}
            disabled={!canRejectReq}
          >
            Отклонить запрос
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsCancelRequestOpen(true)}
            disabled={!canCancelReq}
          >
            Отозвать свой запрос
          </Button>
        </div>

        <ChangeRequestsTable
          requests={openRequests}
          selectedId={selectedRequestId}
          onSelect={handleSelectRequest}
          isLoading={isLoading}
        />
      </div>

      {/* Modals */}
      <ContractOfferModal
        isOpen={isOfferOpen}
        onClose={() => setIsOfferOpen(false)}
        kind={activeKind}
        counterparties={counterparties}
        orders={ordersForOffer}
        onSaved={loadData}
      />

      <ContractAmendmentModal
        isOpen={isAmendOpen}
        onClose={() => setIsAmendOpen(false)}
        kind={activeKind}
        contract={selectedContract}
        onSaved={loadData}
      />

      {/* Confirmations */}
      <ConfirmModal
        isOpen={isAcceptContractOpen}
        onClose={() => setIsAcceptContractOpen(false)}
        onConfirm={handleAcceptContract}
        title="Подтверждение договора"
        message={`Подтвердить договор №${selectedContract?.id} на сумму ${formatMoney(selectedContract?.price)}?`}
        confirmText="Подтвердить договор"
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={isRejectContractOpen}
        onClose={() => setIsRejectContractOpen(false)}
        onConfirm={handleRejectContract}
        title="Отклонение договора"
        message={`Вы действительно хотите отклонить договор №${selectedContract?.id}?`}
        confirmText="Отклонить договор"
        isDanger
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={isTerminateOpen}
        onClose={() => setIsTerminateOpen(false)}
        onConfirm={handleTerminateContract}
        title="Расторжение договора"
        message={`Предложить расторгнуть договор №${selectedContract?.id}? Договор будет расторгнут после согласия второй стороны.`}
        confirmText="Предложить расторгнуть"
        isDanger
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={isAcceptRequestOpen}
        onClose={() => setIsAcceptRequestOpen(false)}
        onConfirm={handleAcceptRequest}
        title="Принятие запроса"
        message={`Принять запрос №${selectedRequest?.id} по договору №${selectedRequest?.contractId}?`}
        confirmText="Принять запрос"
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={isRejectRequestOpen}
        onClose={() => setIsRejectRequestOpen(false)}
        onConfirm={handleRejectRequest}
        title="Отклонение запроса"
        message={`Отклонить запрос №${selectedRequest?.id} по договору №${selectedRequest?.contractId}?`}
        confirmText="Отклонить запрос"
        isDanger
        isLoading={isActionLoading}
      />

      <ConfirmModal
        isOpen={isCancelRequestOpen}
        onClose={() => setIsCancelRequestOpen(false)}
        onConfirm={handleCancelRequest}
        title="Отзыв запроса"
        message={`Отозвать свой запрос №${selectedRequest?.id}?`}
        confirmText="Отозвать запрос"
        isLoading={isActionLoading}
      />
    </div>
  );
}
