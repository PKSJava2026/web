import type { ComponentProps } from "react";
import "./Card.css";

export interface CardProps extends ComponentProps<"div"> {}

export const Card = ({ className = "", children, ...props }: CardProps) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};
