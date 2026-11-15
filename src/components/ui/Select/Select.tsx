import type { ComponentProps } from "react";
import "./Select.css";

export interface SelectProps extends ComponentProps<"select"> {
  options: {
    name: string;
    value: string;
  }[];
}

export const Select = ({
  options,
  className = "",
  ...props
}: SelectProps) => {
  return (
    <select className={`select ${className}`} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.name}
        </option>
      ))}
    </select>
  );
};
