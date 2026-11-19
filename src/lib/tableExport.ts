export type ExportFormat = "csv" | "xlsx";

export function displayCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function csvCell(value: unknown): string {
  const text = displayCell(value);
  const safe =
    typeof value !== "number" && /^[\s\u0000-\u001f]*[=+@-]|^[\t\r\n]/.test(text)
      ? "'" + text
      : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export async function downloadTable(
  format: ExportFormat,
  name: string,
  columns: string[],
  rows: unknown[][],
) {
  const values = [columns, ...rows];
  if (format === "xlsx") {
    const { default: writeXlsxFile } = await import("write-excel-file/browser");
    await writeXlsxFile(
      values.map((row) =>
        row.map((cell) =>
          typeof cell === "number" || typeof cell === "boolean" ? cell : displayCell(cell),
        ),
      ),
    ).toFile(name + ".xlsx");
    return;
  }

  const csv = values.map((row) => row.map(csvCell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name + ".csv";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
