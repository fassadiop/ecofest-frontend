// // src/pages/Layout.jsx
// import React from 'react';

// export default function Layout({ children }) {
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center">
//       <main className="w-full max-w-3xl p-4 flex-1">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           {children}
//         </div>
//       </main>

//       <footer className="w-full max-w-3xl mx-auto mt-6 text-xs text-gray-400 flex justify-between items-center p-4">
//         <span>© ECOFEST 2025 — arts & culture</span>
//         <a
//           href="https://tech4fisheries.vercel.app/"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="hover:text-gray-600"
//         >
//           Conception <span className="font-semibold">Tech4Fisheries</span>
//         </a>
//       </footer>
//     </div>
//   );
// }

// src/pages/Layout.jsx
import React from 'react';
import clsx from 'clsx';

/**
 * Layout variants:
 * - auth   : petite carte centrée (login)
 * - default: page normale — contenu dans une carte confortable (forms)
 * - admin  : plein écran optimisé pour tableaux larges
 *
 * Usage:
 * <Layout variant="auth"> ... </Layout>
 * <Layout variant="default"> ... </Layout>
 * <Layout variant="admin"> ... </Layout>
 */
export default function Layout({ children, variant = 'default', className = '' }) {
  const isAuth = variant === 'auth';
  const isAdmin = variant === 'admin';
  const isDefault = variant === 'default';
  const isPublic = variant === 'public';
  return (
    <div className={clsx(
      'min-h-screen bg-gray-50 flex flex-col items-center',
      // admin variant uses darker subtle background to keep contrast but allow full width
      isAdmin && 'bg-gray-100'
    )}>
      <main
          className={clsx(
            isAdmin ? 'w-full max-w-full px-6 py-6' :
            isAuth ? 'w-full max-w-md p-6 flex items-center justify-center' :
            isPublic ? 'w-full max-w-5xl p-6' :   // ⬅️ public = 0 card blanc
            'w-full max-w-5xl p-6',               // default = card blanc
            className
          )}
        >
          {isAuth ? (
            <div className="w-full bg-white rounded-xl shadow-sm p-6">
              {children}
            </div>
          ) : isDefault ? (
            <div className="w-full bg-white rounded-xl shadow-sm p-6">
              {children}
            </div>
          ) : isPublic ? (
            // ⬅️ Aucune carte ici
            <div className="w-full">
              {children}
            </div>
          ) : (
            <div className="w-full">{children}</div>
          )}
        </main>
      <footer className="w-full max-w-5xl mx-auto mt-6 text-xs text-gray-400 flex justify-between items-center p-4">
        <span>© ECOFEST 2025 — arts & culture</span>
        <a
          href="https://tech4fisheries.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600"
        >
          Conception <span className="font-semibold">Tech4Fisheries</span>
        </a>
      </footer>
    </div>
  );
}
