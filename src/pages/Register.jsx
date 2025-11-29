// src/pages/Register.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPublicInscription, resendConfirmation } from "../api/publicApi";

const LOGO = '/images/logo-ecofest.jpeg'

const MAX_PRENOM = 10;
const MAX_NOM = 7;
const MAX_COMBINED = 17;

function formatName(str) {
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ');
}

export default function Register(){
  const { t, i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.language || 'fr')
  useEffect(()=>{ i18n.changeLanguage(lang) },[lang])

  const [form, setForm] = useState({
    nom:'', prenom:'', email:'', telephone:'', nationalite:'', provenance:'',
    type_profil:'Festivaliers', adresse_complete:'', date_naissance:''
  })
  const [passportFile, setPassportFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e){
    const { name, value } = e.target;
    if(name === 'prenom' || name === 'nom') return;
    setForm(f=>({...f,[name]: value}))
  }

  function handlePrenomChange(e){
    const raw = e.target.value || '';
    const otherLen = (form.nom || '').trim().length;
    const remaining = Math.max(0, MAX_COMBINED - otherLen);
    const allowed = Math.min(MAX_PRENOM, remaining);
    let cleaned = raw.replace(/^\s+/, '').replace(/\s+/g, ' ');
    if(cleaned.length > allowed){
      cleaned = cleaned.slice(0, allowed);
      setError(`La longueur combinée prénom+nom ne peut pas dépasser ${MAX_COMBINED} caractères.`);
    } else {
      setError(null);
    }
    const formatted = formatName(cleaned);
    setForm(f=>({...f, prenom: formatted}));
  }

  function handleNomChange(e){
    const raw = e.target.value || '';
    const otherLen = (form.prenom || '').trim().length;
    const remaining = Math.max(0, MAX_COMBINED - otherLen);
    const allowed = Math.min(MAX_NOM, remaining);
    let cleaned = raw.replace(/^\s+/, '').replace(/\s+/g, ' ');
    if(cleaned.length > allowed){
      cleaned = cleaned.slice(0, allowed);
      setError(`La longueur combinée prénom+nom ne peut pas dépasser ${MAX_COMBINED} caractères.`);
    } else {
      setError(null);
    }
    const formatted = formatName(cleaned);
    setForm(f=>({...f, nom: formatted}));
  }

  function handleFile(e){ setPassportFile(e.target.files[0]) }
  function profileRequiresDOB(profile){ return profile === 'VIP' }

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true); setMessage(null); setError(null)

    const prenomLen = (form.prenom || '').trim().length;
    const nomLen = (form.nom || '').trim().length;

    if(!form.prenom || !form.nom){
      setError("Le prénom et le nom sont requis.");
      setLoading(false);
      return;
    }
    if(prenomLen > MAX_PRENOM || nomLen > MAX_NOM || (prenomLen + nomLen) > MAX_COMBINED){
      setError("Respectez les limites : Prénom ≤ 10, Nom ≤ 7, total ≤ 17 caractères.");
      setLoading(false);
      return;
    }

    try{
      const payload = { ...form }
      if(passportFile) payload.passeport_file = passportFile
      const inscription = await createPublicInscription(payload)
      try { await resendConfirmation(inscription.id) } catch (resendErr) { console.error("Resend confirmation error:", resendErr) }

      setMessage(t('success') || "Inscription reçue — un email de confirmation a été envoyé.")
      setForm({ nom:'', prenom:'', email:'', telephone:'', nationalite:'', provenance:'', type_profil:'Festivaliers', adresse_complete:'', date_naissance:'' })
      setPassportFile(null)
      setTimeout(()=> window.location.href = '/thank-you', 1400)
    } catch(err){
      console.error("submit error:", err)
      setError(typeof err === 'string' ? err : (err.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-4">
        <img src={LOGO} alt="Ecofest logo" className="w-24 h-24 object-contain" />
        <div>
          <h1 className="text-2xl font-extrabold">Ecofest Dakar</h1>
          <h2 className="text-1xl font-extrabold">Du 30 novembre au 06 décembre 2025</h2>
          <p className="text-sm text-gray-600">Inscription — Accès international</p>
        </div>
        <div className="ml-auto">
          <select value={lang} onChange={e => setLang(e.target.value)} className="border rounded px-2 py-1 text-sm">
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="pt">PT</option>
          </select>
        </div>
      </div>

      <hr className="my-6" />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prénom / Nom / autres champs (identiques à ton code) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input name="prenom" value={form.prenom} onChange={handlePrenomChange} required maxLength={MAX_PRENOM} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="Prénom" />
          <div className="text-xs text-gray-500">Max {MAX_PRENOM} caractères</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input name="nom" value={form.nom} onChange={handleNomChange} required maxLength={MAX_NOM} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="Nom" />
          <div className="text-xs text-gray-500">Max {MAX_NOM} caractères</div>
        </div>

        {/* (le reste des champs) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input name="telephone" value={form.telephone} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nationalité</label>
          <input name="nationalite" value={form.nationalite} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Provenance</label>
          <input name="provenance" value={form.provenance} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Profil</label>
          <select name="type_profil" value={form.type_profil} onChange={(e)=>setForm(f=>({...f, type_profil: e.target.value}))} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            <option value="Festivaliers">Festivaliers</option>
            <option value="Presse">Presse</option>
            <option value="Artistes professionnels">Artistes professionnels</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <input name="adresse_complete" value={form.adresse_complete} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Passeport</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFile} className="mt-1 block w-full text-sm text-gray-600" />
          {passportFile && <p className="text-xs text-gray-500 mt-1">{passportFile.name}</p>}
        </div>

        <div className="md:col-span-2 flex items-center justify-between mt-4">
          <div>
            {message && <div className="text-green-600 font-semibold">{message}</div>}
            {error && <div className="text-red-600">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 disabled:opacity-60">
            {loading ? '...' : (t('submit') || 'Envoyer')}
          </button>
        </div>
      </form>
    </div>
  )
}
