import type { ComponentProps } from "react";
import "./Input.css";

interface InputProps extends ComponentProps<"input"> {
  error?: string;
}

export const Input = ({ error, ...props }: InputProps) => {
  return (
    <div className="input">
      <input {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
