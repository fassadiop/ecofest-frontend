// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import ThankYou from "./pages/ThankYou";

// Components
import Layout from "./pages/Layout";
import ProtectedRoute from "./components/ProtectedRoute"; // wrapper qui vérifie auth

export default function App() {
  const { t } = useTranslation(); // si tu utilises i18n

  return (
    <Layout>
      <Routes>
        {/* Page publique d'inscription */}
        <Route path="/" element={<Register />} />

        {/* page de remerciement */}
        <Route path="/thank-you" element={<ThankYou />} />

        {/* Auth admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Dashboard admin protégé */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
