import type { ComponentProps } from "react";
import "./Button.css";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary" | "danger" | "link";
}

export const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};
