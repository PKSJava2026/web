import type { ComponentProps } from "react";
import "./Input.css";

export interface InputProps extends ComponentProps<"input"> {
  error?: string;
}

export const Input = ({
  error,
  className = "",
  style,
  ...props
}: InputProps) => {
  return (
    <div className={`input ${className}`} style={style}>
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
