import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className = "",
  ...props
}) => {
  const variantClass = variant === "secondary" ? "address-btn" : 
                     variant === "outline" ? "reset-btn" : "send-btn";
  return (
    <button
      {...props}
      className={`${variantClass} ${className}`}
      style={props.style || {}}
    >
      {props.children}
    </button>
  );
}