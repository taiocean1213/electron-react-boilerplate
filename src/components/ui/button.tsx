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
  let style: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
  };
  if (variant === "secondary") {
    style = { ...style, background: "#232b3a", color: "#facc15", border: "1px solid #facc15" };
  } else if (variant === "outline") {
    style = { ...style, background: "transparent", color: "#facc15", border: "1px solid #facc15" };
  } else {
    style = { ...style, background: "linear-gradient(90deg, #7dd3fc 0%, #facc15 100%)", color: "#232b3a" };
  }
  return (
    <button
      {...props}
      className={className}
      style={{ ...style, ...(props.style || {}) }}
    >
      {props.children}
    </button>
  );
};
