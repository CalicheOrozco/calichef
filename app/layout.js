import React, { Suspense } from 'react'
import { MyProvider } from '../context/MyContext'
import { AuthProvider } from '../context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Calichef',
  description: 'Recetas de cocina para Thermomix'
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='h-full'>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' href='/favicon2.ico' sizes="any" />
        <meta name='robots' content='noarchive' />
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
        <meta name='theme-color' media='(prefers-color-scheme: dark)' content='#0a0a0a' />
        <meta name='theme-color' media='(prefers-color-scheme: light)' content='#ffffff' />
        <meta name='mobile-web-app-capable' content='yes' />
      </head>
      <body className='min-h-screen bg-neutral-950 text-neutral-50 antialiased'>
        <React.StrictMode>
          <Suspense fallback={<div className='min-h-screen bg-neutral-950' />}>
            <AuthProvider>
              <MyProvider>{children}</MyProvider>
            </AuthProvider>
          </Suspense>
        </React.StrictMode>
      </body>
    </html>
  )
}