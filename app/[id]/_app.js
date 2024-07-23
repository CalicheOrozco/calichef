import React from 'react'
import { MyProvider } from '../../context/MyContext'

function MyApp ({ Component, pageProps }) {
  return (
    <MyProvider>
      <Component {...pageProps} />
    </MyProvider>
  )
}

export default MyApp
