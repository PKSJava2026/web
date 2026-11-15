import type { ComponentProps } from "react";
import "./Checkbox.css";

export interface CheckboxProps extends Omit<ComponentProps<"input">, "type"> {
  label?: string;
}

export const Checkbox = ({
  label,
  className = "",
  checked,
  id,
  ...props
}: CheckboxProps) => {
  return (
    <label className={`checkbox ${className}`} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        className="checkbox-input"
        {...props}
      />
      <span className="checkbox-box" />
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};
