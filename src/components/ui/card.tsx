import React from "react";

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card-header">{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card-title">{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="card-content">{children}</div>
);