// src/pages/Register.jsx
import React, { useState, useEffect } from 'react'
import Layout from './Layout'
import { useTranslation } from 'react-i18next'
import { createPublicInscription, resendConfirmation } from "../api/publicApi";

const LOGO = '/images/logo-ecofest.jpeg' // en dev tu peux remplacer par "sandbox:/mnt/data/Capture1.PNG" si besoin

export default function Register(){
  const { t, i18n } = useTranslation()
  const [lang, setLang] = useState(i18n.language || 'fr')
  useEffect(()=>{ i18n.changeLanguage(lang) },[lang])

  const [form, setForm] = useState({
    nom:'', prenom:'', email:'', telephone:'', nationalite:'', provenance:'',
    type_profil:'All Access', adresse_complete:'', date_naissance:''
  })
  const [passportFile, setPassportFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  function handleChange(e){ setForm(f=>({...f,[e.target.name]: e.target.value})) }
  function handleFile(e){ setPassportFile(e.target.files[0]) }
  function profileRequiresDOB(profile){ return profile === 'VIP' }

  async function handleSubmit(e){
    e.preventDefault()
    setLoading(true); setMessage(null); setError(null)

    try{
      // Construire le payload. createPublicInscription crée le FormData et gère les fichiers.
      const payload = { ...form }
      if(passportFile) payload.passeport_file = passportFile

      // Envoie de l'inscription (POST /api/inscriptions/)
      const inscription = await createPublicInscription(payload)

      // Demander au backend d'envoyer l'email HTML professionnel (resend endpoint)
      try {
        await resendConfirmation(inscription.id)
      } catch (resendErr) {
        // Ne bloque pas l'utilisateur si l'envoi secondaire échoue : log et informer.
        console.error("Resend confirmation error:", resendErr)
      }

      // Feedback utilisateur + reset du formulaire
      setMessage(t('success') || "Inscription reçue — un email de confirmation a été envoyé.")
      setForm({ nom:'', prenom:'', email:'', telephone:'', nationalite:'', provenance:'', type_profil:'All Access', adresse_complete:'', date_naissance:'' })
      setPassportFile(null)

      // Petite attente avant redirection pour montrer le message
      setTimeout(()=> window.location.href = '/thank-you', 1400)
    } catch(err){
      console.error("submit error:", err)
      // createPublicInscription lance des erreurs textuelles; si c'est un objet, stringify pour debug
      setError(typeof err === 'string' ? err : (err.message || JSON.stringify(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
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
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.firstName')}</label>
          <input name="prenom" value={form.prenom} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.lastName')}</label>
          <input name="nom" value={form.nom} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.email')}</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.phone')}</label>
          <input name="telephone" value={form.telephone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.nationality')}</label>
          <input name="nationalite" value={form.nationalite} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.provenance')}</label>
          <input name="provenance" value={form.provenance} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">{t('fields.profileType')}</label>
          <select name="type_profil" value={form.type_profil} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2">
            <option value="Festivaliers">{t('profiles.festivalier') || 'Festivaliers'}</option>
            <option value="Presse">{t('profiles.press')}</option>
            <option value="Artistes professionnels">{t('profiles.artisteprofessionnels')}</option>
          </select>
        </div>

        {profileRequiresDOB(form.type_profil) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('fields.dob')}</label>
            <input type="date" name="date_naissance" value={form.date_naissance} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.address')}</label>
          <input name="adresse_complete" value={form.adresse_complete} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('fields.passport')}</label>
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
