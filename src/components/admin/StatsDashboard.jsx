"use client";
import { useEffect, useState } from "react";
import { API_URL } from "./config";

export default function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // <-- ADAPTE L'URL si besoin: utiliser http://127.0.0.1:8000 si proxy pas configuré
      const res = await fetch(`${API_URL}/admin/statistics`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} — ${text.slice(0,200)}`);
      }
      const json = await res.json();
      setStats(json);
    } catch (err) {
      console.error("Stats load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) return <div className="p-4 bg-white rounded shadow">Chargement des KPIs…</div>;
  if (error) return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-red-600 font-medium">Erreur lors du chargement des KPIs</div>
      <div className="text-xs text-gray-600 mt-2 break-all">{error}</div>
      <button className="mt-3 px-3 py-1 bg-blue-600 text-white rounded" onClick={loadStats}>Réessayer</button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">Inscriptions totales</h3>
        <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
      </div>
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">Validées</h3>
        <p className="text-3xl font-bold text-green-600">{stats?.validees ?? 0}</p>
      </div>
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">En attente</h3>
        <p className="text-3xl font-bold text-orange-600">{stats?.en_attente ?? 0}</p>
      </div>
      <div className="p-4 bg-white rounded-xl shadow">
        <h3 className="text-gray-500 text-sm">Refusées</h3>
        <p className="text-3xl font-bold text-red-600">{stats?.refusees ?? 0}</p>
      </div>
    </div>
  );
}
