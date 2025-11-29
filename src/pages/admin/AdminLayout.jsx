// src/pages/admin/AdminLayout.jsx
import React from "react";
import SidebarAdmin from "../../components/admin/SidebarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* SIDEBAR */}
      <aside className="w-64 min-w-[16rem] bg-white shadow-md p-4">
        <SidebarAdmin />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
