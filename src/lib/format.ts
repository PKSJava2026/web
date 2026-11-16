export const formatDate = (value?: string | null): string => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

export const formatWeight = (kg?: number | null): string => {
  if (kg === null || kg === undefined) return "-";
  if (kg >= 1000) {
    const tons = kg / 1000;
    return `${Number(tons.toFixed(2))} т`;
  }
  return `${Number(kg.toFixed(2))} кг`;
};

export const formatVolume = (m3?: number | null): string => {
  if (m3 === null || m3 === undefined) return "-";
  return `${Number(m3.toFixed(2))} м³`;
};

export const formatMoney = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(amount);
};
