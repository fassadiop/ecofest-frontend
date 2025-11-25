"use client";
import { useEffect, useState } from "react";

export default function InscriptionsTable() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ADAPTE l'URL si nécessaire. Si ton backend expose /api/inscriptions/ utilisez-le.
      const url = `${API_URL}/admin/inscriptions?status=${encodeURIComponent(status)}&country=${encodeURIComponent(country)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} ${res.statusText} — ${text.slice(0,200)}`);
      }
      const json = await res.json();
      // Defensive: si la réponse est un objet contenant `results`
      setData(Array.isArray(json) ? json : (json.results ?? []));
    } catch (err) {
      console.error("Load inscriptions error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [status, country]);

  if (loading) return <div className="p-4 bg-white rounded shadow">Chargement des inscriptions…</div>;
  if (error) return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-red-600">Erreur : {error}</div>
      <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={loadData}>Réessayer</button>
    </div>
  );

  if (!data.length) return <div className="p-4 bg-white rounded shadow">Aucune inscription trouvée.</div>;

  return (
    <div className="border p-4 rounded-xl bg-white mt-6">
      <h2 className="text-xl font-bold mb-4">Liste des inscriptions</h2>
      <div className="flex gap-4 mb-4">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
          <option value="">Tous les statuts</option>
          <option value="En_attente">En attente</option>
          <option value="Validé">Validé</option>
          <option value="Refusé">Refusé</option>
        </select>
        <input type="text" placeholder="Filtrer par pays" value={country} onChange={(e) => setCountry(e.target.value)} className="border p-2 rounded" />
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Profil</th>
            <th className="p-2 border">Provenance</th>
            <th className="p-2 border">Statut</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="text-sm">
              <td className="p-2 border">{item.nom} {item.prenoms}</td>
              <td className="p-2 border">{item.profil}</td>
              <td className="p-2 border">{item.provenance}</td>
              <td className="p-2 border">{item.statut}</td>
              <td className="p-2 border flex gap-2">
                <button className="px-2 py-1 border rounded">Détails</button>
                <button className="px-2 py-1 border rounded">Badge</button>
                <button className="px-2 py-1 bg-green-600 text-white rounded">Valider</button>
                <button className="px-2 py-1 bg-red-600 text-white rounded">Refuser</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
