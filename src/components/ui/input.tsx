import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`input ${className}`}
    style={props.style || {}}
  />
);