import React, { useState } from 'react'
import Layout from '../components/Layout'
import { API_URL } from "../api/config";

export default function Login(){
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState(null)
  const [loading,setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true); setError(null)
    try{
      const res = await fetch(`${API_URL}/token/`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if(res.ok){
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)
        window.location.href = '/admin' // ou /dashboard
      } else {
        setError(data.detail || JSON.stringify(data))
      }
    }catch(err){ setError('Network error') }
    finally{ setLoading(false) }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Connexion</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-2 border rounded" autocomplete="username" />
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" autocomplete="current-password" />
          {error && <div className="text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading ? '...' : 'Login'}</button>
        </form>
      </div>
    </Layout>
  )
}
