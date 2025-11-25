import StatsDashboard from "@/components/admin/StatsDashboard";
import SidebarAdmin from "../../components/admin/SidebarAdmin"; 


export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
      <StatsDashboard />
    </div>
  );
}
