import SidebarAdmin from "@/components/admin/SidebarAdmin";

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <SidebarAdmin />
      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  );
}
