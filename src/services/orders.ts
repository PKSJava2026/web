import { formatDate, formatDateTime } from "#/lib/format";
import { downloadTable, type ExportFormat } from "#/lib/tableExport";
import { z } from "zod";
import api from "#/lib/api";
import { validate, type FieldErrors } from "#/lib/validation";
import type {
  OrderRequest,
  OrderResponse,
  OrderSearchParams,
  OrderSort,
  OrderStatus,
  Role,
} from "#/lib/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новая",
  CONTRACTED: "Договор заключён",
  IN_TRANSIT: "В пути",
  DELIVERED: "Доставлена",
  CANCELLED: "Отменена",
};

export const ORDER_SORT_LABELS: Record<OrderSort, string> = {
  DATE: "По дате",
  STATUS: "По статусу",
  WEIGHT: "По весу",
};

export const orderSchema = z.object({
  cargoDescription: z
    .string()
    .trim()
    .min(1, "Опишите груз")
    .max(1000, "Описание не должно превышать 1000 символов"),
  weightKg: z.coerce
    .number({ error: "Укажите вес" })
    .positive("Вес должен быть больше 0"),
  volumeM3: z.coerce
    .number({ error: "Укажите объем" })
    .positive("Объем должен быть больше 0"),
  origin: z
    .string()
    .trim()
    .min(1, "Укажите пункт отправления")
    .max(255, "Пункт отправления не должен превышать 255 символов"),
  destination: z
    .string()
    .trim()
    .min(1, "Укажите пункт назначения")
    .max(255, "Пункт назначения не должен превышать 255 символов"),
  desiredDate: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val),
      "Дата должна быть в формате ГГГГ-ММ-ДД",
    )
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const getOrders = async (
  role?: Role | null,
  params?: OrderSearchParams,
): Promise<[OrderResponse[], null] | [null, string]> => {
  try {
    let orders: OrderResponse[];
    if (role === "FORWARDER" || role === "ADMIN") {
      orders = await api.orders.search(params);
    } else {
      orders = await api.orders.my();
      if (params) {
        if (params.active) {
          orders = orders.filter(
            (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED",
          );
        }
        if (params.status) {
          orders = orders.filter((o) => o.status === params.status);
        }
        if (params.from) {
          orders = orders.filter(
            (o) => o.createdAt.slice(0, 10) >= params.from!,
          );
        }
        if (params.to) {
          orders = orders.filter(
            (o) => o.createdAt.slice(0, 10) <= params.to!,
          );
        }
        if (params.q) {
          const q = params.q.toLowerCase();
          orders = orders.filter(
            (o) =>
              o.cargoDescription.toLowerCase().includes(q) ||
              o.origin.toLowerCase().includes(q) ||
              o.destination.toLowerCase().includes(q),
          );
        }
        if (params.sort) {
          orders.sort((a, b) => {
            let cmp = 0;
            if (params.sort === "DATE") {
              cmp =
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime();
            } else if (params.sort === "STATUS") {
              cmp = a.status.localeCompare(b.status);
            } else if (params.sort === "WEIGHT") {
              cmp = a.weightKg - b.weightKg;
            }
            return params.desc ? -cmp : cmp;
          });
        }
      }
    }
    return [orders, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить список заявок";
    return [null, message];
  }
};

export const getOrder = async (
  id: number,
): Promise<[OrderResponse, null] | [null, string]> => {
  try {
    const order = await api.orders.get(id);
    return [order, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось загрузить заявку";
    return [null, message];
  }
};

export const createOrder = async (
  data: unknown,
): Promise<[OrderResponse, null] | [null, FieldErrors<OrderInput>]> => {
  const [valid, err] = validate(orderSchema, data);
  if (err) return [null, err];

  try {
    const payload: OrderRequest = {
      ...valid,
      desiredDate: valid.desiredDate ?? null,
    };
    const res = await api.orders.create(payload);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось создать заявку";
    return [null, { general: message }];
  }
};

export const updateOrder = async (
  id: number,
  data: unknown,
): Promise<[OrderResponse, null] | [null, FieldErrors<OrderInput>]> => {
  const [valid, err] = validate(orderSchema, data);
  if (err) return [null, err];

  try {
    const payload: OrderRequest = {
      ...valid,
      desiredDate: valid.desiredDate ?? null,
    };
    const res = await api.orders.update(id, payload);
    return [res, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось обновить заявку";
    return [null, { general: message }];
  }
};

export const cancelOrder = async (
  id: number,
): Promise<[true, null] | [null, string]> => {
  try {
    await api.orders.cancel(id);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось отменить заявку";
    return [null, message];
  }
};

export const deleteOrder = async (
  id: number,
): Promise<[true, null] | [null, string]> => {
  try {
    await api.orders.delete(id);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось удалить заявку";
    return [null, message];
  }
};

export const changeOrderStatus = async (
  id: number,
  status: OrderStatus,
): Promise<[true, null] | [null, string]> => {
  try {
    await api.orders.changeStatus(id, status);
    return [true, null];
  } catch (e: any) {
    const message =
      e?.data?.message || e?.message || "Не удалось изменить статус заявки";
    return [null, message];
  }
};

export const downloadOrdersExport = async (
  format: ExportFormat,
  orders: OrderResponse[],
  withCustomer: boolean,
): Promise<[true, null] | [null, string]> => {
  const columns = [
    "№", ...(withCustomer ? ["Заказчик"] : []), "Груз", "Откуда", "Куда",
    "Вес, кг", "Объём, м³", "Желаемая дата", "Статус", "Создана",
  ];
  const rows = orders.map((order) => [
    order.id, ...(withCustomer ? [order.customerNickname] : []), order.cargoDescription,
    order.origin, order.destination, order.weightKg, order.volumeM3,
    formatDate(order.desiredDate), ORDER_STATUS_LABELS[order.status], formatDateTime(order.createdAt),
  ]);

  try {
    await downloadTable(format, "orders", columns, rows);
    return [true, null];
  } catch {
    return [null, "Не удалось экспортировать заявки"];
  }
};
