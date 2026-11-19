import { useCallback, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/Button";
import { Input } from "#/components/ui/Input";
import { ReportTable } from "#/components/ui/ReportTable";
import { api, type OrderResponse } from "#/lib/api";
import { formatDate } from "#/lib/format";
import { downloadTable, displayCell, type ExportFormat } from "#/lib/tableExport";
import { apiError, useApiData } from "#/lib/useApiData";
import { ORDER_STATUS_LABELS } from "#/services/orders";

export const Route = createFileRoute("/_app/statistics")({ component: StatisticsPage });

function measure(orders: OrderResponse[], key: "weightKg" | "volumeM3", label: string) {
  const values = orders.map((order) => order[key]).filter((value) => typeof value === "number");
  const min = values.reduce((current, value) => Math.min(current, value), Infinity);
  const max = values.reduce((current, value) => Math.max(current, value), -Infinity);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return [
    ["Минимум " + label, values.length ? min : "—"],
    ["Максимум " + label, values.length ? max : "—"],
    ["Среднее значение " + label, values.length ? Number(average.toFixed(2)) : "—"],
  ];
}

function StatisticsPage() {
  const [period, setPeriod] = useState({ from: "", to: "" });
  const [formError, setFormError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const load = useCallback(async () => {
    const recentFrom = new Date();
    recentFrom.setDate(recentFrom.getDate() - 30);
    const from = [
      recentFrom.getFullYear(),
      String(recentFrom.getMonth() + 1).padStart(2, "0"),
      String(recentFrom.getDate()).padStart(2, "0"),
    ].join("-");
    const [orders, recent, company] = await Promise.all([
      api.orders.search({ from: period.from || undefined, to: period.to || undefined }),
      api.orders.search({ from }),
      api.reports.stats(),
    ]);
    return { orders, recentCount: recent.length, company };
  }, [period]);
  const { data, loading, error, refresh } = useApiData(load);
  const columns = ["Показатель", "Значение"];
  const periodLabel =
    period.from || period.to
      ? (period.from ? formatDate(period.from) : "…") +
        " — " +
        (period.to ? formatDate(period.to) : "…")
      : "за всё время";
  const ordersRows = data
    ? [
        ["Всего заявок", data.orders.length],
        ...Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => [
          "Заявок в статусе «" + label + "»",
          data.orders.filter((order) => order.status === status).length,
        ]),
        ...measure(data.orders, "weightKg", "веса, кг"),
        ...measure(data.orders, "volumeM3", "объёма, м³"),
        ["Создано за последние 30 дней", data.recentCount],
      ]
    : [];
  const companyRows = data?.company.map((item) => [item.name, item.value]) ?? [];

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const from = String(fields.get("from"));
    const to = String(fields.get("to"));
    if (from && to && to < from) {
      setFormError("Дата «По» не может быть раньше даты «С»");
      return;
    }
    setFormError("");
    setPeriod({ from, to });
  }

  async function exportReport(format: ExportFormat) {
    setExportError("");
    setExporting(true);
    try {
      await downloadTable(format, "statistics", columns, [
        ["Период заявок", periodLabel],
        ...ordersRows,
        ...companyRows,
      ]);
    } catch (error) {
      setExportError(apiError(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="report-page">
      <h1>Статистика</h1>
      <form
        className="report-actions"
        onSubmit={apply}
        onReset={() => {
          setFormError("");
          setPeriod({ from: "", to: "" });
        }}
      >
        <div className="report-field">
          <label htmlFor="stats-from">С</label>
          <Input id="stats-from" name="from" type="date" />
        </div>
        <div className="report-field">
          <label htmlFor="stats-to">По</label>
          <Input id="stats-to" name="to" type="date" />
        </div>
        <Button type="submit">Применить</Button>
        <Button type="reset" variant="secondary">
          Сбросить
        </Button>
      </form>
      <div className="report-actions">
        <Button
          variant="secondary"
          disabled={!data || exporting}
          onClick={() => exportReport("csv")}
        >
          Экспорт CSV
        </Button>
        <Button
          variant="secondary"
          disabled={!data || exporting}
          onClick={() => exportReport("xlsx")}
        >
          Экспорт Excel
        </Button>
      </div>
      {loading && <p role="status">Загрузка…</p>}
      {formError && <p role="alert">{formError}</p>}
      {(error || exportError) && <p role="alert">{error || exportError}</p>}
      {error && (
        <div>
          <Button onClick={refresh}>Повторить</Button>
        </div>
      )}
      {data && (
        <>
          <p>Период: {periodLabel}</p>
          <h2>Показатели по заявкам</h2>
          <ReportTable label="Показатели по заявкам" columns={columns} rows={ordersRows} />
          <h2>Показатели компании</h2>
          <ReportTable
            label="Показатели компании"
            columns={columns}
            rows={companyRows.map((row) => row.map(displayCell))}
          />
        </>
      )}
    </section>
  );
}
