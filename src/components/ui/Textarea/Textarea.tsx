import type { ComponentProps } from "react";
import "./Textarea.css";

export interface TextareaProps extends ComponentProps<"textarea"> {
  error?: string;
}

export const Textarea = ({
  error,
  className = "",
  style,
  ...props
}: TextareaProps) => {
  return (
    <div className={`textarea ${className}`} style={style}>
      <textarea {...props} />
      {error && <span className="error">{error}</span>}
    </div>
  );
};
