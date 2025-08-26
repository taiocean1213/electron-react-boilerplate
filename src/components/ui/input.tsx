import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    {...props}
    className={className}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #2e3545",
      background: "#181c24",
      color: "#fff",
      outline: "none",
      ...props.style,
    }}
  />
);
