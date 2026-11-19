import type { ReactNode } from "react";
import "./ReportTable.css";

export function ReportTable({
  columns,
  rows,
  label,
  selected,
  onSelect,
}: {
  columns: string[];
  rows: ReactNode[][];
  label: string;
  selected?: number;
  onSelect?: (index: number) => void;
}) {
  if (!rows.length) return <p>Нет данных</p>;

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
              onClick={onSelect ? () => onSelect(index) : undefined}
            >
              {row.map((value, column) => (
                <td key={column}>
                  {column === 0 && onSelect ? (
                    <button
                      type="button"
                      aria-pressed={selected === index}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(index);
                      }}
                    >
                      {value}
                    </button>
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
