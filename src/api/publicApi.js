// src/api/publicApi.js

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function createPublicInscription(payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([k,v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });

  const res = await fetch(`${API_BASE}/inscriptions/`, {
    method: "POST",
    body: form
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur ${res.status}: ${text}`);
  }
  return res.json();
}

export async function resendConfirmation(inscriptionId) {
  const res = await fetch(`${API_BASE}/inscriptions/${inscriptionId}/resend_confirmation/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend error ${res.status}: ${txt}`);
  }
  return res.json();
}
