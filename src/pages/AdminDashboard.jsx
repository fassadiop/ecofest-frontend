import React, { useEffect, useState } from 'react'
import AdminLayout from './admin/AdminLayout'
import AdminTable from '../components/AdminTable'
import { useAuth } from '../auth/AuthProvider'
import { fetchAdminInscriptions } from '../api/adminApi'

export default function AdminDashboard(){
  const auth = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(){
    setLoading(true); setError(null)
    try{
      const access = localStorage.getItem('access')
      const json = await fetchAdminInscriptions(access)
      setData(json)
    }catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ if(!auth.user) { window.location.href = '/login'; return } load() }, [auth.user])

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
        <div className="flex gap-2">
          <button onClick={()=>{ auth.logout(); }} className="bg-gray-100 px-3 py-2 rounded">Logout</button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && <AdminTable data={data} reload={load} />}
    </AdminLayout>
  )
}
