import type { ReactNode } from "react";
import "./ReportTable.css";

export function ReportTable({
  columns,
  rows,
  label,
  selected,
  onSelect,
  onActivate,
  emptyMessage = "Нет данных",
}: {
  columns: string[];
  rows: ReactNode[][];
  label: string;
  selected?: number;
  onSelect?: (index: number) => void;
  onActivate?: (index: number) => void;
  emptyMessage?: string;
}) {
  if (!rows.length) return <p>{emptyMessage}</p>;

  return (
    <div className="report-scroll" tabIndex={0} role="region" aria-label={label}>
      <table className="report-table" aria-label={label}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className={selected === index ? "selected" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-current={selected === index || undefined}
              onClick={onSelect ? () => onSelect(index) : undefined}
              onDoubleClick={onActivate ? () => onActivate(index) : undefined}
              onKeyDown={
                onSelect &&
                ((event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter") onSelect(index);
                  if (event.key === " ") event.preventDefault();
                })
              }
              onKeyUp={
                onSelect &&
                ((event) => {
                  if (event.target === event.currentTarget && event.key === " ") onSelect(index);
                })
              }
            >
              {row.map((value, column) => (
                <td key={column}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
