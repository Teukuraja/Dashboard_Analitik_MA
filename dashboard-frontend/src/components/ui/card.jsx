// src/components/ui/Card.jsx

import React from 'react';

// Card Component
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white shadow-md rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

// CardHeader Component
export function CardHeader({ title, subtitle }) {
  return (
    <div className="mb-2">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

// CardContent Component
export function CardContent({ children }) {
  return <div className="text-gray-700">{children}</div>;
}
