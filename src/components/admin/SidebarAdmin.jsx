// src/components/admin/SidebarAdmin.jsx
"use client";
import { Link } from "react-router-dom";
import React from "react";

export default function SidebarAdmin() {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h2 className="text-lg font-bold mb-4">ECOFEST Admin</h2>
      <nav className="flex flex-col gap-2">
        <a className="hover:text-blue-600" href="/admin">Dashboard</a>
        <a className="hover:text-blue-600" href="/admin/inscriptions">Inscriptions</a>
        <a className="hover:text-blue-600" href="/admin/users">Utilisateurs</a>
        <a className="hover:text-blue-600" href="/admin/export">Exports</a>
      </nav>
    </div>
  );
}
