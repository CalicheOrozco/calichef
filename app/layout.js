import React from 'react'
import { MyProvider } from '../context/MyContext'
import { AuthProvider } from '../context/AuthContext'
import './globals.css'

export const metadata = {
  title: 'Calichef',
  description: 'Recetas de cocina para Thermomix'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='es'>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' href='/favicon2.ico' />
        <meta name='robots' content='noarchive' />
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
      </head>
      <body>
        <AuthProvider>
          <MyProvider>{children}</MyProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
