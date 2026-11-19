import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/Button";
import { ReportTable } from "#/components/ui/ReportTable";
import { api } from "#/lib/api";
import { displayCell, downloadTable, type ExportFormat } from "#/lib/tableExport";
import { apiError, useApiData } from "#/lib/useApiData";

export const Route = createFileRoute("/_app/database-tables")({ component: DatabaseTablesPage });

function DatabaseTablesPage() {
  const names = useApiData(api.reports.tables);
  const [selection, setSelection] = useState("");
  const name = selection || names.data?.[0] || "";
  const load = useCallback(() => (name ? api.reports.table(name) : Promise.resolve(null)), [name]);
  const table = useApiData(load);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  async function exportSelected(format: ExportFormat) {
    if (!table.data || exporting) return;
    setExporting(true);
    setExportError("");
    try {
      await downloadTable(format, table.data.name, table.data.columns, table.data.rows);
    } catch (error) {
      setExportError(apiError(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="report-page">
      <h1>Таблицы БД</h1>
      <div className="report-actions">
        <div className="report-field">
          <label htmlFor="report-table-name">Таблица</label>
          <select
            id="report-table-name"
            value={name}
            disabled={!names.data?.length}
            onChange={(event) => {
              setSelection(event.target.value);
              setExportError("");
            }}
          >
            {!name && <option value="">Нет таблиц</option>}
            {names.data?.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <Button
          variant="secondary"
          disabled={!table.data || exporting}
          onClick={() => exportSelected("csv")}
        >
          Экспорт CSV
        </Button>
        <Button
          variant="secondary"
          disabled={!table.data || exporting}
          onClick={() => exportSelected("xlsx")}
        >
          Экспорт Excel
        </Button>
      </div>
      {(names.loading || (name && table.loading)) && <p role="status">Загрузка…</p>}
      {(names.error || table.error || exportError) && (
        <p role="alert">{names.error || table.error || exportError}</p>
      )}
      {names.error && (
        <div>
          <Button onClick={names.refresh}>Повторить</Button>
        </div>
      )}
      {table.error && (
        <div>
          <Button onClick={table.refresh}>Повторить</Button>
        </div>
      )}
      {table.data && (
        <ReportTable
          label={table.data.name}
          columns={table.data.columns}
          rows={table.data.rows.map((row) => row.map(displayCell))}
        />
      )}
    </section>
  );
}
