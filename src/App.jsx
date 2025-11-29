// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import Register from "./pages/Register";
import ThankYou from "./pages/ThankYou";

// Components
import Layout from "./pages/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // wrapper qui vérifie auth

export default function App() {
  const { t } = useTranslation();

  return (
    <Routes>
      {/* Public routes wrapped with global Layout */}
      <Route
        path="/"
        element={
          <Layout variant="public">
            <Register />
          </Layout>
        }
      />
      <Route
        path="/thank-you"
        element={
          <Layout variant="default">
            <ThankYou />
          </Layout>
        }
      />

      {/* Admin login (no global Layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin routes — distinct routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

