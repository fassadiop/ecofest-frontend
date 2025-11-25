export async function fetchAdminInscriptions(accessToken){
  const res = await fetch('http://127.0.0.1:8000/api/admin/inscriptions/', {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if(!res.ok) {
    const txt = await res.text().catch(()=>null)
    throw new Error(txt || 'Failed to fetch admin inscriptions')
  }
  return res.json()
}

export async function patchInscriptionStatus(accessToken, id, statut, admin_remarque=''){
  const res = await fetch(`http://127.0.0.1:8000/api/admin/inscriptions/${id}/status/`, {
    method: 'PATCH',
    headers: { 'Content-Type':'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ statut, admin_remarque })
  })
  if(!res.ok){
    const txt = await res.text().catch(()=>null)
    throw new Error(txt || 'Failed to patch')
  }
  return res.json()
}

export async function downloadFile(accessToken, url, filename){
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
  if(!res.ok) {
    const txt = await res.text().catch(()=>null)
    throw new Error(txt || 'File download failed')
  }
  const blob = await res.blob()
  const a = document.createElement('a')
  const objectUrl = URL.createObjectURL(blob)
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
