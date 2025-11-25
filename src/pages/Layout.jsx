import React from 'react';

export default function Layout({ children }) {
  return (
    <><div className="min-h-screen flex flex-col items-center py-10 px-4 bg-gray-50">
      {/* card contenant le contenu principal */}
      <main className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        {children}
      </main>
    </div><div>
        <footer className="w-full max-w-4xl text-xs text-gray-400 mt-8 text-center">
          © ECOFEST 2025 — arts & culture
        </footer>
      </div></>
  );
}
