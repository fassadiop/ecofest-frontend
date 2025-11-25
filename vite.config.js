import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Assure-toi que plugin-react est installé: npm install -D @vitejs/plugin-react
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // force IPv4
    port: 5173,
    strictPort: true // échoue si le port est pris -> évite confusions
  },
  // base: '/', // si tu changes de base en prod, fais ici
})
