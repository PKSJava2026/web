import { z } from "zod";
import api from "#/lib/api";
import { validate, type FieldErrors } from "#/lib/validation";
import type {
  AmendmentRequest,
  ChangeRequestResponse,
  ChangeRequestStatus,
  ChangeRequestType,
  ContractKind,
  ContractRequest,
  ContractResponse,
  ContractSearchParams,
  ContractStatus,
  OrderResponse,
  Role,
  UserResponse,
} from "#/lib/types";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  PENDING: "Ожидает подтверждения",
  ACTIVE: "Действует",
  COMPLETED: "Завершён",
  TERMINATED: "Расторгнут",
  REJECTED: "Отклонён",
};

export const CHANGE_REQUEST_TYPE_LABELS: Record<ChangeRequestType, string> = {
  AMEND: "Изменение",
  TERMINATE: "Расторжение",
};

export const CHANGE_REQUEST_STATUS_LABELS: Record<
  ChangeRequestStatus,
  string
> = {
  PENDING: "Ожидает ответа",
  ACCEPTED: "Принят",
  REJECTED: "Отклонён",
  CANCELLED: "Отозван",
};

export const CONTRACT_KIND_LABELS: Record<
  ContractKind,
  { title: string; counterparty: string }
> = {
  CUSTOMER: {
    title: "Договоры с заказчиками",
    counterparty: "Заказчик",
  },
  CARRIER: {
    title: "Договоры с перевозчиками",
    counterparty: "Перевозчик",
  },
};

export const contractSchema = z
  .object({
    orderId: z.coerce
      .number({ error: "Выберите заявку" })
      .positive("Выберите заявку"),
    counterpartyId: z.coerce
      .number({ error: "Выберите контрагента" })
      .positive("Выберите контрагента"),
    price: z.coerce
      .number({ error: "Укажите цену" })
      .positive("Цена должна быть больше 0")
      .max(9999999999.99, "Цена превышает допустимый максимум"),
    terms: z
      .string()
      .trim()
      .max(2000, "Условия не должны превышать 2000 символов")
      .optional()
      .nullable(),
    startDate: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
        "Формат даты: ГГГГ-ММ-ДД",
      )
      .transform((val) => (val && val.length > 0 ? val : null)),
    endDate: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
        "Формат даты: ГГГГ-ММ-ДД",
      )
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "Дата окончания не может быть раньше даты начала",
      path: ["endDate"],
    },
  );

export type ContractInput = z.infer<typeof contractSchema>;

export const amendmentSchema = z
  .object({
    price: z.coerce
      .number({ error: "Укажите корректную цену" })
      .positive("Цена должна быть больше 0")
      .max(9999999999.99, "Цена превышает допустимый максимум")
      .optional()
      .nullable(),
    terms: z
      .string()
      .trim()
      .max(2000, "Условия не должны превышать 2000 символов")
      .optional()
      .nullable(),
    startDate: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
        "Формат даты: ГГГГ-ММ-ДД",
      )
      .transform((val) => (val && val.length > 0 ? val : null)),
    endDate: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
        "Формат даты: ГГГГ-ММ-ДД",
      )
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .refine(
    (data) => {
      return (
        (data.price !== undefined && data.price !== null) ||
        (data.terms !== undefined &&
          data.terms !== null &&
          data.terms.length > 0) ||
        Boolean(data.startDate) ||
        Boolean(data.endDate)
      );
    },
    {
      message: "Необходимо заполнить хотя бы одно поле для изменения",
      path: ["price"],
    },
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "Дата окончания не может быть раньше даты начала",
      path: ["endDate"],
    },
  );

export type AmendmentInput = z.infer<typeof amendmentSchema>;

const getClient = (kind: ContractKind) =>
  kind === "CUSTOMER" ? api.contracts.customer : api.contracts.carrier;

export const getContracts = async (
  kind: ContractKind,
  role?: Role | null,
  params?: ContractSearchParams,
): Promise<[ContractResponse[], null] | [null, string]> => {
  try {
    const client = getClient(kind);
    let contracts: ContractResponse[];
    if (role === "FORWARDER" || role === "ADMIN") {
      contracts = await client.search(params);
    } else {
      contracts = await client.my();
      if (params) {
        if (params.status) {
          contracts = contracts.filter((c) => c.status === params.status);
        }
        if (params.orderId) {
          contracts = contracts.filter((c) => c.orderId === params.orderId);
        }
      }
    }
    return [contracts, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить список договоров";
    return [null, message];
  }
};

export const getContract = async (
  kind: ContractKind,
  id: number,
): Promise<[ContractResponse, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    const contract = await client.get(id);
    return [contract, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить договор";
    return [null, message];
  }
};

export const getOpenRequests = async (
  kind: ContractKind,
): Promise<[ChangeRequestResponse[], null] | [null, string]> => {
  try {
    const client = getClient(kind);
    const requests = await client.openRequests();
    return [requests, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить открытые запросы";
    return [null, message];
  }
};

export const createContract = async (
  kind: ContractKind,
  data: unknown,
): Promise<[ContractResponse, null] | [null, FieldErrors<ContractInput>]> => {
  const [valid, err] = validate(contractSchema, data);
  if (err) return [null, err];

  try {
    const client = getClient(kind);
    const payload: ContractRequest = {
      orderId: valid.orderId,
      counterpartyId: valid.counterpartyId,
      price: valid.price,
      terms: valid.terms ?? null,
      startDate: valid.startDate ?? null,
      endDate: valid.endDate ?? null,
    };
    const res = await client.create(payload);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось предложить договор";
    return [null, { general: message }];
  }
};

export const acceptContract = async (
  kind: ContractKind,
  id: number,
): Promise<[true, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    await client.accept(id);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось подтвердить договор";
    return [null, message];
  }
};

export const rejectContract = async (
  kind: ContractKind,
  id: number,
): Promise<[true, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    await client.reject(id);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось отклонить договор";
    return [null, message];
  }
};

export const requestAmendment = async (
  kind: ContractKind,
  contractId: number,
  data: unknown,
): Promise<
  [ChangeRequestResponse, null] | [null, FieldErrors<AmendmentInput>]
> => {
  const [valid, err] = validate(amendmentSchema, data);
  if (err) return [null, err];

  try {
    const client = getClient(kind);
    const payload: AmendmentRequest = {
      price: valid.price ?? null,
      terms: valid.terms ?? null,
      startDate: valid.startDate ?? null,
      endDate: valid.endDate ?? null,
    };
    const res = await client.amend(contractId, payload);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось отправить запрос на изменение условий";
    return [null, { general: message }];
  }
};

export const requestTermination = async (
  kind: ContractKind,
  contractId: number,
): Promise<[ChangeRequestResponse, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    const res = await client.terminate(contractId);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось отправить запрос на расторжение";
    return [null, message];
  }
};

export const acceptChangeRequest = async (
  kind: ContractKind,
  requestId: number,
): Promise<[true, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    await client.acceptRequest(requestId);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось принять запрос";
    return [null, message];
  }
};

export const rejectChangeRequest = async (
  kind: ContractKind,
  requestId: number,
): Promise<[true, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    await client.rejectRequest(requestId);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось отклонить запрос";
    return [null, message];
  }
};

export const cancelChangeRequest = async (
  kind: ContractKind,
  requestId: number,
): Promise<[true, null] | [null, string]> => {
  try {
    const client = getClient(kind);
    await client.cancelRequest(requestId);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось отозвать запрос";
    return [null, message];
  }
};

export const getCounterparties = async (
  kind: ContractKind,
): Promise<[UserResponse[], null] | [null, string]> => {
  try {
    const role: Role = kind === "CUSTOMER" ? "CUSTOMER" : "CARRIER";
    const users = await api.users.byRole(role);
    return [users, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось загрузить список контрагентов";
    return [null, message];
  }
};

export const getOrdersForOffer = async (
  kind: ContractKind,
  existingContracts: ContractResponse[],
): Promise<[OrderResponse[], null] | [null, string]> => {
  try {
    const openOrderIds = new Set(
      existingContracts
        .filter((c) => c.status === "PENDING" || c.status === "ACTIVE")
        .map((c) => c.orderId),
    );

    const requiredStatus = kind === "CUSTOMER" ? "NEW" : "CONTRACTED";
    const allOrders = await api.orders.search({ status: requiredStatus });

    const availableOrders = allOrders.filter(
      (order) => !openOrderIds.has(order.id),
    );

    return [availableOrders, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить доступные заявки";
    return [null, message];
  }
};

// Business rules predicates
export const canRespondToContract = (
  contract: ContractResponse | null,
  userId?: number | null,
  isStaff: boolean = false,
): boolean => {
  return (
    contract !== null &&
    !isStaff &&
    contract.status === "PENDING" &&
    contract.counterpartyId === userId
  );
};

export const canChangeContract = (
  contract: ContractResponse | null,
  openRequests: ChangeRequestResponse[],
): boolean => {
  return (
    contract !== null &&
    contract.status === "ACTIVE" &&
    contract.orderStatus !== "DELIVERED" &&
    contract.orderStatus !== "IN_TRANSIT" &&
    !openRequests.some(
      (r) => r.contractId === contract.id && r.status === "PENDING",
    )
  );
};

export const canRespondToRequest = (
  request: ChangeRequestResponse | null,
  contract: ContractResponse | null,
  userId?: number | null,
  isStaff: boolean = false,
): boolean => {
  if (
    !request ||
    !contract ||
    request.status !== "PENDING" ||
    userId === undefined ||
    userId === null
  ) {
    return false;
  }
  const initiatedByCounterparty =
    request.initiatedBy === contract.counterpartyId;
  return isStaff
    ? initiatedByCounterparty
    : !initiatedByCounterparty && contract.counterpartyId === userId;
};

export const canCancelRequest = (
  request: ChangeRequestResponse | null,
  userId?: number | null,
): boolean => {
  return (
    request !== null &&
    request.status === "PENDING" &&
    userId !== undefined &&
    userId !== null &&
    request.initiatedBy === userId
  );
};
