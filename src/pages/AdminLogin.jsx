import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

export default function AdminLogin(){
  const auth = useAuth()
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState(null)

  async function handleSubmit(e){
    e.preventDefault(); setLoading(true); setError(null)
    try{
      await auth.login({ username, password })
      // redirect to dashboard
      window.location.href = '/admin'
    }catch(err){
      setError(err.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" type="text" className="w-full p-2 border rounded" autoComplete="username" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" autoComplete="current-password" />
          {error && <div className="text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white p-2 rounded">{loading? '...' : 'Login'}</button>
            <button type="button" onClick={()=>{ setUsername('olga'); setPassword('changeme') }} className="bg-gray-100 p-2 rounded">Fill</button>
          </div>
        </form>
      </div>
    </div>
  )
}
