import { API_URL } from "./config";

export async function fetchAdminInscriptions(accessToken){
  const res = await fetch(`${API_URL}/admin/inscriptions/`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if(!res.ok) {
    const txt = await res.text().catch(()=>null)
    throw new Error(txt || 'Failed to fetch admin inscriptions')
  }
  return res.json()
}

export async function patchInscriptionStatus(accessToken, id, statut, admin_remarque=''){
  const res = await fetch(`${API_URL}/admin/inscriptions/${id}/status/`, {
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


export async function validateInscription(id, accessToken) {
  const res = await fetch(`${API_URL}/admin/inscriptions/${id}/validate/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Validate error ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function refuseInscription(id, accessToken) {
  const res = await fetch(`${API_URL}/admin/inscriptions/${id}/refuse/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Refuse error ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function fetchBadgeUrl(id, accessToken) {
  const res = await fetch(`${API_URL}/admin/inscriptions/${id}/badge/`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Badge error ${res.status}: ${txt}`);
  }
  return res.json(); // { badge_url: "https://..." }
}

export async function fetchPiecesUrls(id, accessToken) {
  const res = await fetch(`${API_URL}/admin/inscriptions/${id}/pieces/`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Pieces error ${res.status}: ${txt}`);
  }
  return res.json(); // { passeport_url?, cni_url?, carte_presse_url? }
}

export async function fetchUsers(access) {
  const res = await fetch(`${API_URL}/admin/users/`, {
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(access, payload) {
  // payload: { username, email, first_name, last_name, telephone, role, langue_pref, password? }
  const res = await fetch(`${API_URL}/admin/users/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || JSON.stringify(data));
  return data;
}