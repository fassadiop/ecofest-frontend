import React, { useMemo, useState } from 'react'
import { patchInscriptionStatus, downloadFile } from '../api/adminApi'
import { useAuth } from '../auth/AuthProvider'

export default function AdminTable({ data, reload }){
  const auth = useAuth()
  const access = auth.access.current
  const [filter, setFilter] = useState({ profile:'', nationality:'', statut:'' })
  const [loadingId, setLoadingId] = useState(null)

  const filtered = useMemo(()=>{
    return data.filter(d=>{
      if(filter.profile && d.type_profil !== filter.profile) return false
      if(filter.nationality && d.nationalite !== filter.nationality) return false
      if(filter.statut && d.statut !== filter.statut) return false
      return true
    })
  },[data, filter])

  const uniqueProfiles = Array.from(new Set(data.map(d=>d.type_profil))).filter(Boolean)
  const uniqueNationalities = Array.from(new Set(data.map(d=>d.nationalite))).filter(Boolean)
  const uniqueStatuts = Array.from(new Set(data.map(d=>d.statut))).filter(Boolean)

  async function doAction(id, statut){
    setLoadingId(id)
    try{
      await patchInscriptionStatus(access, id, statut)
      reload()
    }catch(err){ alert('Action failed: '+err.message) }
    finally{ setLoadingId(null) }
  }

  const handleDownloadBadge = async (id) =>{
    try{
      await downloadFile(access, `http://127.0.0.1:8000/api/admin/inscriptions/${id}/badge/`, `badge_${id}.png`)
    }catch(err){ alert('Download failed: '+err.message) }
  }
  const handleDownloadInvitation = async (id) =>{
    try{
      await downloadFile(access, `http://127.0.0.1:8000/api/admin/inscriptions/${id}/invitation/`, `invitation_${id}.pdf`)
    }catch(err){ alert('Download failed: '+err.message) }
  }

  return (
    <div>
      <div className="flex gap-2 items-center mb-4">
        <select value={filter.profile} onChange={e=>setFilter(f=>({...f, profile: e.target.value}))} className="border p-2 rounded">
          <option value="">All profiles</option>
          {uniqueProfiles.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filter.nationality} onChange={e=>setFilter(f=>({...f, nationality: e.target.value}))} className="border p-2 rounded">
          <option value="">All nationalities</option>
          {uniqueNationalities.map(n=> <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filter.statut} onChange={e=>setFilter(f=>({...f, statut: e.target.value}))} className="border p-2 rounded">
          <option value="">All statuses</option>
          {uniqueStatuts.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={()=>{ setFilter({ profile:'', nationality:'', statut:'' }) }} className="ml-auto text-sm text-gray-600">Reset</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-2">#</th>
              <th className="p-2">Name</th>
              <th className="p-2">Nationality</th>
              <th className="p-2">Provenance</th>
              <th className="p-2">Profile</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item=> (
              <tr key={item.id} className="border-b">
                <td className="p-2 align-top">{item.id}</td>
                <td className="p-2 align-top">{item.nom} {item.prenom}</td>
                <td className="p-2 align-top">{item.nationalite}</td>
                <td className="p-2 align-top">{item.provenance}</td>
                <td className="p-2 align-top">{item.type_profil}</td>
                <td className="p-2 align-top">{item.email}</td>
                <td className="p-2 align-top">{item.statut}</td>
                <td className="p-2 align-top">
                  <div className="flex gap-2">
                    <button onClick={()=>doAction(item.id, 'Validé')} disabled={loadingId===item.id} className="bg-green-600 text-white px-2 py-1 rounded text-sm">Valider</button>
                    <button onClick={()=>doAction(item.id, 'Refusé')} disabled={loadingId===item.id} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Refuser</button>
                    <button onClick={()=>handleDownloadBadge(item.id)} className="bg-gray-200 px-2 py-1 rounded text-sm">Badge</button>
                    <button onClick={()=>handleDownloadInvitation(item.id)} className="bg-gray-200 px-2 py-1 rounded text-sm">Invitation</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
