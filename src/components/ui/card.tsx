import React from "react";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div
    className={className}
    style={{
      background: "#232b3a",
      borderRadius: "12px",
      boxShadow: "0 4px 24px #000a",
      border: "1px solid #2e3545",
      padding: "0",
      margin: "0",
    }}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: "20px 24px 8px 24px", borderBottom: "1px solid #2e3545" }}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: "1.2em", fontWeight: 700 }}>{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: "16px 24px" }}>{children}</div>
);
