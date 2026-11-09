import type { ComponentProps } from "react";
import "./Button.css";

interface ButtonProps extends ComponentProps<"button"> {}

export const Button = (props: ButtonProps) => {
  return (
    <button className="button" {...props}>
      {props.children}
    </button>
  );
};
