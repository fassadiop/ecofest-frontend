// src/pages/admin/UsersPage.jsx
import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { fetchUsers, createUser } from '../../api/adminApi';
import { useAuth } from '../../auth/AuthProvider';

export default function UsersPage(){
  const auth = useAuth();
  const access = localStorage.getItem('access');
  const [users,setUsers] = useState([]);
  const [form,setForm] = useState({ username:'', email:'', first_name:'', last_name:'', telephone:'', role:'Vérificateur', langue_pref:'FR' });
  const [msg,setMsg] = useState(null), [err,setErr]=useState(null), [loading,setLoading]=useState(false);

  async function load(){
    setLoading(true); setErr(null);
    try{ const json = await fetchUsers(access); setUsers(json); }
    catch(e){ setErr(e.message); }
    finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); },[]);

  async function handleCreate(e){
    e.preventDefault();
    setErr(null);
    try{
      const res = await createUser(access, form);
      setMsg(`Utilisateur créé id=${res.id}${res.generated_password ? ' motdepasse: '+res.generated_password : ''}`);
      setForm({ username:'', email:'', first_name:'', last_name:'', telephone:'', role:'Vérificateur', langue_pref:'FR' });
      load();
    }catch(e){ setErr(e.message); }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] table-auto">
              <thead className="bg-gray-100">
                <tr className="text-left text-xs text-gray-600">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Telephone</th>
                  <th className="px-3 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id} className="border-b">
                    <td className="px-3 py-2">{u.id}</td>
                    <td className="px-3 py-2">{u.username}</td>
                    <td className="px-3 py-2">{u.first_name} {u.last_name}</td>
                    <td className="px-3 py-2 truncate max-w-[220px]" title={u.email}>{u.email}</td>
                    <td className="px-3 py-2">{u.telephone}</td>
                    <td className="px-3 py-2">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Créer un utilisateur</h3>
          {msg && <div className="text-green-600 mb-2">{msg}</div>}
          {err && <div className="text-red-600 mb-2">{err}</div>}
          <form onSubmit={handleCreate} className="space-y-2">
            <input required placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full p-2 border rounded" />
            <input required placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Prénom" value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} className="p-2 border rounded" />
              <input placeholder="Nom" value={form.last_name} onChange={e=>setForm({...form, last_name:e.target.value})} className="p-2 border rounded" />
            </div>
            <input placeholder="Téléphone" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})} className="w-full p-2 border rounded" />
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} className="w-full p-2 border rounded">
              <option value="Vérificateur">Vérificateur</option>
              <option value="Admin">Admin</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Créer</button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
