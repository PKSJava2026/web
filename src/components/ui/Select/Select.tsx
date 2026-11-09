import type { ComponentProps } from "react";
import "./Select.css";

interface SelectProps extends ComponentProps<"select"> {
  options: {
    name: string;
    value: string;
  }[];
}

export const Select = ({ options, ...props }: SelectProps) => {
  return (
    <select {...props}>
      {options.map((opt) => (
        <option value={opt.value}>{opt.name}</option>
      ))}
    </select>
  );
};
