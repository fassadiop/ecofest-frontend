import React from 'react'
import Layout from './Layout'

export default function ThankYou(){
  return (
    <Layout>
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Merci — Inscription reçue</h2>
        <p>Nous avons bien reçu votre inscription. Vous recevrez un e-mail après validation.</p>
      </div>
    </Layout>
  )
}
