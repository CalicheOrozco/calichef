'use client'
import Card from '../components/Card'
import { useContext } from 'react'
import Navbar from '@/components/Navbar'
import { CalichefContext } from '../context/MyContext.jsx'

export default function Home () {
  const contextValue = useContext(CalichefContext)

  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Navbar')
  }

  const { AllData } = contextValue

  return (
    <>
      <Navbar className='pb-10' />
      <div className='container mx-auto py-20 px-4 min-h-screen'>
        {AllData ? (
          <>
            <p className='text-white flex justify-end items-center py-2'>
              {AllData.length} recetas encontradas
            </p>
            <div className='flex flex-wrap justify-center md:justify-between items-center gap-y-5'>
              {AllData.slice(0, 250).map((item, index) => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  rating_score={item.rating_score}
                  rating_count={item.rating_count}
                  time={item.total_time}
                  img_url={item.image_url}
                />
              ))}
            </div>
          </>
        ) : (
          <div className='flex justify-center items-center h-screen'>
            <div className='text-center'>
              <svg
                className='animate-spin h-8 w-8 text-gray-600 mx-auto'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              <p className='mt-4 text-lg text-gray-600'>Loading...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
