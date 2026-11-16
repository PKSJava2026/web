import { z } from "zod";
import api from "#/lib/api";
import { validate, type FieldErrors } from "#/lib/validation";
import type {
  CooperationRequestResponse,
  CooperationRequestStatus,
  CreateCooperationRequest,
  ContractRequest,
  ContractResponse,
  OrderResponse,
  Role,
} from "#/lib/types";

// Validation schemas
export const createCooperationSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Опишите ваш опыт и условия работы")
    .max(2000, "Описание не должно превышать 2000 символов"),
  vehicleInfo: z
    .string()
    .trim()
    .min(1, "Укажите информацию о вашем транспорте")
    .max(2000, "Информация о транспорте не должна превышать 2000 символов"),
});

export type CreateCooperationInput = z.infer<typeof createCooperationSchema>;

export const cooperationContractSchema = z
  .object({
    orderId: z.coerce
      .number({ error: "Выберите заявку на перевозку" })
      .positive("Выберите заявку на перевозку"),
    price: z.coerce
      .number({ error: "Введите цену" })
      .positive("Цена должна быть больше нуля")
      .max(1_000_000_000, "Превышена максимальная цена"),
    terms: z
      .string()
      .trim()
      .max(2000, "Слишком длинные условия")
      .optional()
      .nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Дата начала не может быть позже даты окончания",
      path: ["endDate"],
    },
  );

export type CooperationContractInput = z.infer<typeof cooperationContractSchema>;

// Russian status labels
export const COOPERATION_STATUS_LABELS: Record<CooperationRequestStatus, string> = {
  NEW: "Новая",
  PROCESSED: "Обработана",
  CANCELLED: "Отозвана",
};

// Rights predicates
export const canCancelCooperationRequest = (
  request: CooperationRequestResponse | null,
  isCarrier: boolean,
): boolean => {
  return Boolean(isCarrier && request && request.status === "NEW");
};

export const canCreateContractFromCooperation = (
  request: CooperationRequestResponse | null,
  isCarrier: boolean,
): boolean => {
  return Boolean(!isCarrier && request && request.status === "NEW");
};

// Operations
export const getCooperationRequests = async (
  role?: Role | null,
  status?: CooperationRequestStatus,
): Promise<[CooperationRequestResponse[], null] | [null, string]> => {
  try {
    let requests: CooperationRequestResponse[];
    if (role === "CARRIER") {
      requests = await api.cooperation.my();
    } else {
      requests = await api.cooperation.list(status || "NEW");
    }
    return [requests, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось загрузить заявки о сотрудничестве";
    return [null, message];
  }
};

export const createCooperationRequest = async (
  input: CreateCooperationInput,
): Promise<
  | [CooperationRequestResponse, null]
  | [null, FieldErrors<CreateCooperationInput>]
> => {
  const [valid, validationError] = validate(createCooperationSchema, input);
  if (validationError) {
    return [null, validationError];
  }

  try {
    const payload: CreateCooperationRequest = {
      description: valid.description,
      vehicleInfo: valid.vehicleInfo,
    };
    const res = await api.cooperation.create(payload);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось отправить заявку о сотрудничестве";
    return [null, { general: message } as FieldErrors<CreateCooperationInput>];
  }
};

export const cancelCooperationRequest = async (
  id: number,
): Promise<[true, null] | [null, string]> => {
  try {
    await api.cooperation.cancel(id);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось отозвать заявку о сотрудничестве";
    return [null, message];
  }
};

export const createContractFromCooperation = async (
  requestId: number,
  carrierId: number,
  input: CooperationContractInput,
): Promise<
  | [ContractResponse, null]
  | [null, FieldErrors<CooperationContractInput>]
> => {
  const [valid, validationError] = validate(cooperationContractSchema, input);
  if (validationError) {
    return [null, validationError];
  }

  try {
    const payload: ContractRequest = {
      orderId: valid.orderId,
      counterpartyId: carrierId,
      price: valid.price,
      terms: valid.terms || null,
      startDate: valid.startDate || null,
      endDate: valid.endDate || null,
    };
    const res = await api.cooperation.createContract(requestId, payload);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось заключить договор с перевозчиком";
    return [null, { general: message } as FieldErrors<CooperationContractInput>];
  }
};

export const getOrdersForCooperationContract = async (): Promise<
  [OrderResponse[], null] | [null, string]
> => {
  try {
    const [carrierContracts, allOrders] = await Promise.all([
      api.contracts.carrier.search(),
      api.orders.search({ status: "CONTRACTED" }),
    ]);

    const activeOrPendingOrderIds = new Set(
      carrierContracts
        .filter((c) => c.status === "PENDING" || c.status === "ACTIVE")
        .map((c) => c.orderId),
    );

    const availableOrders = allOrders.filter(
      (o) => !activeOrPendingOrderIds.has(o.id),
    );

    return [availableOrders, null];
  } catch (e: any) {
    const message =
      e?.data?.message ||
      e?.message ||
      "Не удалось загрузить доступные заявки на перевозку";
    return [null, message];
  }
};
