// import React, { useMemo, useState } from "react";
// import { useAuth } from "../auth/AuthProvider";
// import { API_URL } from "../api/config";

// import {
//   validateInscription,
//   refuseInscription,
//   fetchBadgeUrl,
//   fetchPiecesUrls,
//   patchInscriptionStatus,
//   downloadFile
// } from "../api/adminApi";

// /**
//  * AdminTable — version robuste pour déterminer si current user est Admin.
//  * - fallback: décodage JWT si auth.user absent
//  * - affiche badge debug (temporaire) pour voir la valeur role / payload
//  */
// export default function AdminTable({ data, reload }) {
//   const auth = useAuth();
//   const access = auth?.access || localStorage.getItem('access') || null;
//   const user = auth?.user || null;

//   const [filter, setFilter] = useState({
//     profile: "",
//     nationality: "",
//     statut: "",
//   });

//   const [loadingId, setLoadingId] = useState(null);

//   // ----------------------------
//   // Helper: try decode JWT payload safely
//   // ----------------------------
//   function decodeJwtPayload(token) {
//     if (!token) return null;
//     try {
//       const part = token.split(".")[1];
//       if (!part) return null;
//       // base64 decode with padding fix
//       const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
//       const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
//       const json = atob(padded);
//       return JSON.parse(json);
//     } catch (err) {
//       // non-blocking
//       return null;
//     }
//   }

//   // ----------------------------
//   // Compute isAdmin with multiple fallbacks
//   // ----------------------------
//   const tokenPayload = decodeJwtPayload(access);
//   const isAdmin = (() => {
//     // 1) from auth.user if present
//     if (user) {
//       // role as string
//       if (typeof user.role === "string" && user.role.trim().toLowerCase() === "admin") return true;
//       // roles array
//       if (Array.isArray(user.roles) && user.roles.some(r => String(r).toLowerCase() === "admin")) return true;
//       // groups-like
//       if (Array.isArray(user.groups) && user.groups.some(g => String(g).toLowerCase() === "admin")) return true;
//       // django flags
//       if (user.is_superuser || user.is_staff) return true;
//       // raw payload inside user
//       const raw = user.raw_payload || {};
//       if (raw && (raw.is_superuser || raw.is_staff)) return true;
//       if (raw && raw.role && String(raw.role).toLowerCase() === "admin") return true;
//     }

//     // 2) from decoded token payload fallback
//     if (tokenPayload) {
//       if (tokenPayload.role && String(tokenPayload.role).toLowerCase() === "admin") return true;
//       if (Array.isArray(tokenPayload.roles) && tokenPayload.roles.some(r => String(r).toLowerCase() === "admin")) return true;
//       if (tokenPayload.is_superuser || tokenPayload.is_staff) return true;
//       // some backends include 'groups' or 'permissions' claims
//       if (Array.isArray(tokenPayload.groups) && tokenPayload.groups.some(g => String(g).toLowerCase() === "admin")) return true;
//     }

//     // 3) fallback: check localStorage cached user (if you store one)
//     try {
//       const cached = localStorage.getItem("user");
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         if (parsed.role && String(parsed.role).toLowerCase() === "admin") return true;
//         if (parsed.is_superuser || parsed.is_staff) return true;
//       }
//     } catch (e) {
//       // ignore
//     }

//     return false;
//   })();

//   // ------------------------------
//   // Filtrage optimisé
//   // ------------------------------
//   const filtered = useMemo(() => {
//     return data.filter((d) => {
//       if (filter.profile && d.type_profil !== filter.profile) return false;
//       if (filter.nationality && d.nationalite !== filter.nationality) return false;
//       if (filter.statut && d.statut !== filter.statut) return false;
//       return true;
//     });
//   }, [data, filter]);

//   const uniqueProfiles = [...new Set(data.map((d) => d.type_profil))].filter(Boolean);
//   const uniqueNationalities = [...new Set(data.map((d) => d.nationalite))].filter(Boolean);
//   const uniqueStatuts = [...new Set(data.map((d) => d.statut))].filter(Boolean);

//   // ------------------------------
//   // Action générique (validate / refuse)
//   // ------------------------------
//   const doAction = async (id, actionFn) => {
//     setLoadingId(id);
//     try {
//       await actionFn(id, access);
//       await reload();
//     } catch (err) {
//       alert("Erreur: " + (err?.message || String(err)));
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ------------------------------
//   // Télécharger badge
//   // ------------------------------
//   const handleDownloadBadge = async (id) => {
//     try {
//       await downloadFile(
//         access,
//         `${API_URL}/admin/inscriptions/${id}/badge/`,
//         `badge_${id}.png`
//       );
//     } catch (err) {
//       alert("Download failed: " + (err?.message || String(err)));
//     }
//   };

//   // ------------------------------
//   // Télécharger invitation
//   // ------------------------------
//   const handleDownloadInvitation = async (id) => {
//     try {
//       await downloadFile(
//         access,
//         `${API_URL}/admin/inscriptions/${id}/invitation/`,
//         `invitation_${id}.pdf`
//       );
//     } catch (err) {
//       alert("Download failed: " + (err?.message || String(err)));
//     }
//   };

//   // ------------------------------ UI
//   return (
//     <div>
//       {/* FILTRES */}
//       <div className="flex gap-2 items-center mb-4">
//         <select
//           value={filter.profile}
//           onChange={(e) =>
//             setFilter((f) => ({ ...f, profile: e.target.value }))
//           }
//           className="border p-2 rounded"
//         >
//           <option value="">All profiles</option>
//           {uniqueProfiles.map((p) => (
//             <option key={p} value={p}>{p}</option>
//           ))}
//         </select>

//         <select
//           value={filter.nationality}
//           onChange={(e) =>
//             setFilter((f) => ({ ...f, nationality: e.target.value }))
//           }
//           className="border p-2 rounded"
//         >
//           <option value="">All nationalities</option>
//           {uniqueNationalities.map((n) => (
//             <option key={n} value={n}>{n}</option>
//           ))}
//         </select>

//         <select
//           value={filter.statut}
//           onChange={(e) =>
//             setFilter((f) => ({ ...f, statut: e.target.value }))
//           }
//           className="border p-2 rounded"
//         >
//           <option value="">All statuses</option>
//           {uniqueStatuts.map((s) => (
//             <option key={s} value={s}>{s}</option>
//           ))}
//         </select>

//         <button
//           onClick={() =>
//             setFilter({ profile: "", nationality: "", statut: "" })
//           }
//           className="ml-auto text-sm text-gray-600"
//         >
//           Reset
//         </button>
//       </div>

//       {/* TABLE */}
//       <div className="overflow-x-auto">
//         <table className="w-full min-w-[1400px] table-auto text-sm">
//           <thead className="bg-gray-100">
//             <tr className="text-left uppercase text-xs text-gray-600">
//               <th className="px-3 py-2">#</th>
//               <th className="px-3 py-2">Name</th>
//               <th className="px-3 py-2">Nationality</th>
//               <th className="px-3 py-2">Provenance</th>
//               <th className="px-3 py-2">Profile</th>
//               <th className="px-3 py-2">Email</th>
//               <th className="px-3 py-2">Status</th>
//               <th className="px-3 py-2">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.map((item) => (
//               <tr key={item.id} className="border-b hover:bg-gray-50">
//                 <td className="px-3 py-2">{item.id}</td>
//                 <td className="px-3 py-2">{item.prenom} {item.nom}</td>
//                 <td className="px-3 py-2">{item.nationalite}</td>
//                 <td className="px-3 py-2">{item.provenance}</td>
//                 <td className="px-3 py-2">{item.type_profil}</td>
//                 <td className="px-3 py-2 truncate max-w-[250px]" title={item.email}>{item.email}</td>
//                 <td className="px-3 py-2">{item.statut}</td>
//                 <td className="p-2">
//                   <div className="flex gap-2 items-center">
//                     {/* Badge & Voir pièces */}
//                     <button className="bg-gray-200 px-2 py-1 rounded text-sm"
//                       onClick={async () => {
//                         try {
//                           const { badge_url } = await fetchBadgeUrl(item.id, access);
//                           window.open(badge_url, "_blank");
//                         } catch {
//                           alert("Erreur récupération badge");
//                         }
//                       }}>Badge</button>

//                     <button className="bg-gray-200 px-2 py-1 rounded text-sm"
//                       onClick={async () => {
//                         try {
//                           const urls = await fetchPiecesUrls(item.id, access);
//                           for (const key of Object.keys(urls)) {
//                             if (urls[key]) window.open(urls[key], "_blank");
//                           }
//                         } catch {
//                           alert("Erreur récupération pièces");
//                         }
//                       }}>Voir pièces</button>

//                     {/* Admin-only actions */}
//                     {(
//                       <>
//                         <button className="bg-green-600 text-white px-2 py-1 rounded text-sm"
//                           disabled={loadingId === item.id}
//                           onClick={() => doAction(item.id, validateInscription)}>Valider</button>

//                         <button className="bg-red-600 text-white px-2 py-1 rounded text-sm"
//                           disabled={loadingId === item.id}
//                           onClick={() => doAction(item.id, refuseInscription)}>Refuser</button>
//                       </>
//                     )}

//                     {/* Debug small badge showing detected role/payload */}
//                     <span className="ml-2 text-xs text-gray-500">
//                       role: {user?.role || (tokenPayload && tokenPayload.role) || (user?.is_superuser ? 'superuser' : 'unknown')}
//                     </span>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// src/components/AdminTable.jsx
// import React, { useMemo, useState } from "react";
// import { useAuth } from "../auth/AuthProvider";
// import { API_URL } from "../api/config";

// import {
//   validateInscription,
//   refuseInscription,
//   fetchBadgeUrl,
//   fetchPiecesUrls,
//   patchInscriptionStatus,
//   downloadFile
// } from "../api/adminApi";

// export default function AdminTable({ data, reload }) {
//   const auth = useAuth();
//   const access = auth?.access || localStorage.getItem('access');
//   const currentRole = auth?.user?.role || null;
//   const [filter, setFilter] = useState({
//     profile: "",
//     nationality: "",
//     statut: "",
//   });

//   const [loadingId, setLoadingId] = useState(null);
//   const [exporting, setExporting] = useState(false);
//   const [generatingBadges, setGeneratingBadges] = useState(false);

//   // ------------------------------
//   // 📌 Filtrage optimisé
//   // ------------------------------
//   const filtered = useMemo(() => {
//     return data.filter((d) => {
//       if (filter.profile && d.type_profil !== filter.profile) return false;
//       if (filter.nationality && d.nationalite !== filter.nationality)
//         return false;
//       if (filter.statut && d.statut !== filter.statut) return false;
//       return true;
//     });
//   }, [data, filter]);

//   const uniqueProfiles = [...new Set(data.map((d) => d.type_profil))].filter(Boolean);
//   const uniqueNationalities = [...new Set(data.map((d) => d.nationalite))].filter(Boolean);
//   const uniqueStatuts = [...new Set(data.map((d) => d.statut))].filter(Boolean);

//   // ------------------------------
//   // 📌 Action générique (validate / refuse)
//   // ------------------------------
//   const doAction = async (id, actionFn) => {
//     setLoadingId(id);
//     try {
//       await actionFn(id, access);
//       await reload();
//     } catch (err) {
//       alert("Erreur: " + (err.message || err));
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   // ------------------------------
//   // 📌 Télécharger badge (utilitaire déjà présent)
//   // ------------------------------
//   const handleDownloadBadge = async (id) => {
//     try {
//       await downloadFile(
//         access,
//         `${API_URL}/admin/inscriptions/${id}/badge/`,
//         `badge_${id}.png`
//       );
//     } catch (err) {
//       alert("Download failed: " + (err.message || err));
//     }
//   };

//   // ------------------------------
//   // 📌 Télécharger invitation
//   // ------------------------------
//   const handleDownloadInvitation = async (id) => {
//     try {
//       await downloadFile(
//         access,
//         `${API_URL}/admin/inscriptions/${id}/invitation/`,
//         `invitation_${id}.pdf`
//       );
//     } catch (err) {
//       alert("Download failed: " + (err.message || err));
//     }
//   };

//   // ------------------------------
//   // 📌 Export CSV (client-side) -> Excel-friendly
//   // ------------------------------
//   function csvEscape(value) {
//     if (value === null || value === undefined) return "";
//     const s = String(value);
//     // If contains comma, quote or newline, wrap in quotes and escape quotes
//     if (/[",\n]/.test(s)) {
//       return `"${s.replace(/"/g, '""')}"`;
//     }
//     return s;
//   }

//   const handleExportCsv = async () => {
//     try {
//       setExporting(true);
//       // Headers: Name, Nationality, Provenance, Profile, Email
//       const headers = ["Name", "Nationality", "Provenance", "Profile", "Email"];
//       const rows = filtered.map((r) => [
//         `${r.prenom || ""} ${r.nom || ""}`.trim(),
//         r.nationalite || "",
//         r.provenance || "",
//         r.type_profil || "",
//         r.email || "",
//       ]);

//       const csvLines = [
//         headers.join(","),
//         ...rows.map((cols) => cols.map(csvEscape).join(","))
//       ];
//       const csvContent = csvLines.join("\r\n");

//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       // extension .csv (Excel can open it). Use a name with date.
//       const now = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
//       a.download = `ecofest_inscriptions_${now}.csv`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error(err);
//       alert("Export failed: " + (err.message || err));
//     } finally {
//       setExporting(false);
//     }
//   };

//   // ------------------------------
//   // 📌 Générer / télécharger ZIP des badges (server-side)
//   // ------------------------------
//   const BADGES_DOWNLOAD_PATH = "/api/admin/badges/download/"; // <-- adapte si nécessaire

//   const handleGenerateBadgesZip = async () => {
//     if (!confirm("Générer et télécharger le fichier ZIP contenant tous les badges ?")) return;
//     try {
//       setGeneratingBadges(true);
//       const res = await fetch(`${API_URL}${BADGES_DOWNLOAD_PATH}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${access}`,
//         },
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Erreur serveur: ${res.status} ${text}`);
//       }

//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `badges_ecofest.zip`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error(err);
//       alert("Erreur téléchargement badges: " + (err.message || err));
//     } finally {
//       setGeneratingBadges(false);
//     }
//   };

//   // ------------------------------
//   // 📌 UI
//   // ------------------------------
//   return (
//     <div>
//       {/* ----------------------- */}
//       {/* 🔍 FILTRES + ACTIONS TOP */}
//       {/* ----------------------- */}
//       <div className="flex gap-2 items-center mb-4">
//         <select
//           value={filter.profile}
//           onChange={(e) =>
//             setFilter((f) => ({ ...f, profile: e.target.value }))
//           }
//           className="border p-2 rounded"
//         >
//           <option value="">All profiles</option>
//           {uniqueProfiles.map((p) => (
//             <option key={p} value={p}>
//               {p}
//             </option>
//           ))}
//         </select>

//         <select
//           value={filter.nationality}
//           onChange={(e) =>
//             setFilter((f) => ({ ...f, nationality: e.target.value }))
//           }
//           className="border p-2 rounded"
//         >
//           <option value="">All nationalities</option>
//           {uniqueNationalities.map((n) => (
//             <option key={n} value={n}>
//               {n}
//             </option>
//           ))}
//         </select>

//         <select
//           value={filter.statut}
//           onChange={(e) =>
//             setFilter((f) => ({ ...f, statut: e.target.value }))
//           }
//           className="border p-2 rounded"
//         >
//           <option value="">All statuses</option>
//           {uniqueStatuts.map((s) => (
//             <option key={s} value={s}>
//               {s}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={() =>
//             setFilter({ profile: "", nationality: "", statut: "" })
//           }
//           className="text-sm text-gray-600"
//         >
//           Reset
//         </button>

//         {/* Spacer */}
//         <div className="flex-1" />

//         {/* Exporter CSV */}
//         <button
//           onClick={handleExportCsv}
//           disabled={exporting}
//           className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
//         >
//           {exporting ? "Export..." : "Exporter (Excel)"}
//         </button>

//         {/* Générer badges - Admin only */}
//         {currentRole === "Admin" && (
//           <button
//             onClick={handleGenerateBadgesZip}
//             disabled={generatingBadges}
//             className="ml-2 bg-green-600 text-white px-3 py-1 rounded text-sm"
//           >
//             {generatingBadges ? "Génération..." : "Générer badges (ZIP)"}
//           </button>
//         )}
//       </div>

//       {/* ----------------------- */}
//       {/* 📋 TABLE */}
//       {/* ----------------------- */}
//       <div className="overflow-x-auto">
//         <table className="w-full min-w-[1400px] table-auto text-sm">
//           <thead className="bg-gray-100">
//             <tr className="text-left uppercase text-xs text-gray-600">
//               <th className="px-3 py-2">#</th>
//               <th className="px-3 py-2">Name</th>
//               <th className="px-3 py-2">Nationality</th>
//               <th className="px-3 py-2">Provenance</th>
//               <th className="px-3 py-2">Profile</th>
//               <th className="px-3 py-2">Email</th>
//               <th className="px-3 py-2">Status</th>
//               <th className="px-3 py-2">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filtered.map((item, i) => (
//               <tr key={item.id} className="border-b hover:bg-gray-50">
//                 <td className="px-3 py-2">{item.id}</td>
//                 <td className="px-3 py-2">{item.prenom} {item.nom}</td>
//                 <td className="px-3 py-2">{item.nationalite}</td>
//                 <td className="px-3 py-2">{item.provenance}</td>
//                 <td className="px-3 py-2">{item.type_profil}</td>
//                 <td className="px-3 py-2 truncate max-w-[250px]" title={item.email}>{item.email}</td>
//                 <td className="px-3 py-2">{item.statut}</td>
//                 <td className="p-2">
//                   <div className="flex gap-2">

//                     {/* BADGE & VOIR PIÈCES (accessible à Admin & Vérificateur) */}
//                     <button className="bg-gray-200 px-2 py-1 rounded text-sm" onClick={async () => {
//                       try {
//                         const { badge_url } = await fetchBadgeUrl(item.id, access);
//                         window.open(badge_url, "_blank");
//                       } catch {
//                         alert("Erreur récupération badge");
//                       }
//                     }}>Badge</button>

//                     <button className="bg-gray-200 px-2 py-1 rounded text-sm" onClick={async () => {
//                       try {
//                         const urls = await fetchPiecesUrls(item.id, access);
//                         for (const key of Object.keys(urls)) {
//                           if (urls[key]) window.open(urls[key], "_blank");
//                         }
//                       } catch {
//                         alert("Erreur récupération pièces");
//                       }
//                     }}>Voir pièces</button>

//                     {/* Admin-only actions */}
//                     {/*currentRole === 'Admin' &&*/ (
//                       <>
//                         <button className="bg-green-600 text-white px-2 py-1 rounded text-sm" disabled={loadingId === item.id}
//                                       onClick={() => doAction(item.id, validateInscription)}>Valider</button>
//                         <button className="bg-red-600 text-white px-2 py-1 rounded text-sm" disabled={loadingId === item.id}
//                                       onClick={() => doAction(item.id, refuseInscription)}>Refuser</button>
//                       </>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// src/components/AdminTable.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_URL } from "../api/config";

import {
  validateInscription,
  refuseInscription,
  fetchBadgeUrl,
  fetchPiecesUrls,
  downloadFile
} from "../api/adminApi";

export default function AdminTable({ data = [], reload }) {
  const auth = useAuth();
  const access = auth?.access || localStorage.getItem('access');
  const currentRole = auth?.user?.role || null;

  // --- UI state: filtres + recherche + pagination
  const [filter, setFilter] = useState({
    profile: "",
    nationality: "",
    statut: "",
  });
  const [q, setQ] = useState(""); // recherche texte libre
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const [loadingId, setLoadingId] = useState(null);
  const [exporting, setExporting] = useState(false);


  // Reset page when filters/search change
  useEffect(() => { setPage(1); }, [filter, q, pageSize]);

  // ------------------------------
  // Filtrage optimisé + recherche
  // ------------------------------
  const filtered = useMemo(() => {
    const txt = (q || "").trim().toLowerCase();
    return data.filter((d) => {
      if (filter.profile && d.type_profil !== filter.profile) return false;
      if (filter.nationality && d.nationalite !== filter.nationality) return false;
      if (filter.statut && d.statut !== filter.statut) return false;

      if (!txt) return true;

      // recherche texte sur plusieurs champs
      const hay = [
        d.prenom,
        d.nom,
        d.email,
        d.nationalite,
        d.provenance,
        d.type_profil,
      ].filter(Boolean).join(" ").toLowerCase();

      return hay.indexOf(txt) !== -1;
    });
  }, [data, filter, q]);

  // pagination calculations
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visible = filtered.slice(startIndex, startIndex + pageSize);

  // ------------------------------
  // Actions (validate / refuse)
  // ------------------------------
  const doAction = async (id, actionFn) => {
    setLoadingId(id);
    try {
      await actionFn(id, access);
      await reload();
    } catch (err) {
      alert("Erreur: " + (err?.message || err));
    } finally {
      setLoadingId(null);
    }
  };

  // ------------------------------
  // Téléchargements
  // ------------------------------
  const handleDownloadBadge = async (id) => {
    try {
      await downloadFile(
        access,
        `${API_URL}/admin/inscriptions/${id}/badge/`,
        `badge_${id}.png`
      );
    } catch (err) {
      alert("Download failed: " + (err?.message || err));
    }
  };

  const handleDownloadInvitation = async (id) => {
    try {
      await downloadFile(
        access,
        `${API_URL}/admin/inscriptions/${id}/invitation/`,
        `invitation_${id}.pdf`
      );
    } catch (err) {
      alert("Download failed: " + (err?.message || err));
    }
  };

  // ------------------------------
  // Helper pagination UI
  // ------------------------------
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const pageNumbers = useMemo(() => {
    // build a compact page list (max 7 numbers)
    const maxButtons = 7;
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxButtons + 1); }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

    // ------------------------------
  // 📌 Export CSV (client-side) -> Excel-friendly
  // ------------------------------
  function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const s = String(value);
    // If contains comma, quote or newline, wrap in quotes and escape quotes
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const handleExportCsv = async () => {
    try {
      setExporting(true);

      // Headers
      const headers = ["Name", "Nationality", "Provenance", "Profile", "Email"];

      // Data
      const rows = filtered.map((r) => [
        `${r.prenom || ""} ${r.nom || ""}`.trim(),
        r.nationalite || "",
        r.provenance || "",
        r.type_profil || "",
        r.email || "",
      ]);

      const csvLines = [
        headers.join(","),
        ...rows.map((cols) => cols.map(csvEscape).join(",")),
      ];

      const csvContent = csvLines.join("\r\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const now = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      a.download = `ecofest_inscriptions_${now}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Export failed: " + (err.message || err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* TOP BAR: recherche + filtres + actions globales */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Recherche (nom, prénom, email, pays, provenance...)"
            className="border p-2 rounded w-full md:w-96"
          />
          <button onClick={() => setQ("")} className="text-sm text-gray-600">Clear</button>
        </div>

        <div className="flex gap-2 items-center mt-2 md:mt-0 md:ml-4">
          <select
            value={filter.profile}
            onChange={(e) => setFilter((f) => ({ ...f, profile: e.target.value }))}
            className="border p-2 rounded"
          >
            <option value="">All profiles</option>
            {[...new Set(data.map((d) => d.type_profil))].filter(Boolean).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filter.nationality}
            onChange={(e) => setFilter((f) => ({ ...f, nationality: e.target.value }))}
            className="border p-2 rounded"
          >
            <option value="">All nationalities</option>
            {[...new Set(data.map((d) => d.nationalite))].filter(Boolean).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <select
            value={filter.statut}
            onChange={(e) => setFilter((f) => ({ ...f, statut: e.target.value }))}
            className="border p-2 rounded"
          >
            <option value="">All statuses</option>
            {[...new Set(data.map((d) => d.statut))].filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button
            onClick={() => { setFilter({ profile: "", nationality: "", statut: "" }); setQ(""); }}
            className="ml-auto text-sm text-gray-600"
          >
            Reset
          </button>
        </div>

        {/* right side: page size + export stub */}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-gray-500">Lignes</label>
          <select value={pageSize} onChange={(e)=> setPageSize(Number(e.target.value))} className="border p-2 rounded">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          {/* Export / Générer badges : on attendra l'implémentation backend si volumineux */}
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
          >
            {exporting ? "Export..." : "Exporter (Excel)"}
          </button>

          <button onClick={() => { window.dispatchEvent(new CustomEvent('admin:generate_badges')); }} className="bg-green-600 text-white px-3 py-2 rounded text-sm">Générer badges</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] table-auto text-sm">
          <thead className="bg-gray-100">
            <tr className="text-left uppercase text-xs text-gray-600">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Nationality</th>
              <th className="px-3 py-2">Provenance</th>
              <th className="px-3 py-2">Profile</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((item, i) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{item.id}</td>
                <td className="px-3 py-2">{item.prenom} {item.nom}</td>
                <td className="px-3 py-2">{item.nationalite}</td>
                <td className="px-3 py-2">{item.provenance}</td>
                <td className="px-3 py-2">{item.type_profil}</td>
                <td className="px-3 py-2 truncate max-w-[250px]" title={item.email}>{item.email}</td>
                <td className="px-3 py-2">{item.statut}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="bg-gray-200 px-2 py-1 rounded text-sm" onClick={async () => {
                      try {
                        const { badge_url } = await fetchBadgeUrl(item.id, access);
                        window.open(badge_url, "_blank");
                      } catch {
                        alert("Erreur récupération badge");
                      }
                    }}>Badge</button>

                    <button className="bg-gray-200 px-2 py-1 rounded text-sm" onClick={async () => {
                      try {
                        const urls = await fetchPiecesUrls(item.id, access);
                        for (const key of Object.keys(urls)) {
                          if (urls[key]) window.open(urls[key], "_blank");
                        }
                      } catch {
                        alert("Erreur récupération pièces");
                      }
                    }}>Voir pièces</button>

                    {/*currentRole === 'Admin' &&*/ (
                      <>
                        <button className="bg-green-600 text-white px-2 py-1 rounded text-sm" disabled={loadingId === item.id}
                                        onClick={() => doAction(item.id, validateInscription)}>Valider</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded text-sm" disabled={loadingId === item.id}
                                        onClick={() => doAction(item.id, refuseInscription)}>Refuser</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">Aucun résultat</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Affichage {total === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + pageSize, total)} sur {total}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="px-2 py-1 border rounded text-sm">« First</button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-2 py-1 border rounded text-sm">Prev</button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`px-3 py-1 rounded text-sm ${p === currentPage ? 'bg-blue-600 text-white' : 'border'}`}
            >
              {p}
            </button>
          ))}

          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 py-1 border rounded text-sm">Next</button>
          <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="px-2 py-1 border rounded text-sm">Last »</button>
        </div>
      </div>
    </div>
  );
}
