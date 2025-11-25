// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider"; // suppose que tu fournis useAuth

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useAuth?.() ?? { user: null, isAuthenticated: false };

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}