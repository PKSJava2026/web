import type { CSSProperties } from "react";
import "./SortHeader.css";

export function SortHeader({
  label,
  style,
  descending,
  onClick,
}: {
  label: string;
  style?: CSSProperties;
  descending?: boolean;
  onClick: () => void;
}) {
  return (
    <th
      scope="col"
      className="sort-header"
      style={style}
      aria-sort={descending === undefined ? undefined : descending ? "descending" : "ascending"}
    >
      <button type="button" onClick={onClick}>
        {label}
        <span aria-hidden="true" />
      </button>
    </th>
  );
}
