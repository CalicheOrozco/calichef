import { Inter } from 'next/font/google'
import './globals.css'
import { MyProvider } from '../context/MyContext'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Calichef',
  description: 'Recetas de cocina para Thermomix'
}

export default function RootLayout ({ children }) {
  return (
    <html lang='en'>
      <Head>
        <link rel='manifest' href='/manifest.json' />
        <link rel='icon' href='/favicon2.ico' />
        <meta name='robots' content='noarchive' />
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />
      </Head>
      <body className={inter.className}>
        <MyProvider>{children}</MyProvider>
      </body>
    </html>
  )
}
