'use client'
import Card from '@/components/Card'
import { useContext, useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { CalichefContext } from '../../context/MyContext'

function Index () {
  const contextValue = useContext(CalichefContext)

  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Navbar')
  }

  const { userRecipes, AllData } = contextValue
  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    if (userRecipes && AllData) {
      const idRecommended = userRecipes || []

      const recommended = AllData.filter(item =>
        idRecommended.includes(item.id)
      )

      // crear array con las recetas recomendadas
      const recommendedDetails = recommended.map(item => ({
        id: item.id,
        title: item.title,
        rating_score: item.rating_score,
        rating_count: item.rating_count,
        time: item.total_time,
        img_url: item.image_url
      }))
      setRecommended(recommendedDetails)
    }
  }, [userRecipes, AllData])

  return (
    <>
      <Navbar className='pb-10' />
      <div className='container mx-auto py-20 px-4 min-h-screen'>
        {userRecipes ? (
          <>
            <p className='text-white flex justify-end items-center py-2'>
              {userRecipes.length} recetas encontradas
            </p>
            <div className='flex flex-wrap justify-center md:justify-between items-center gap-y-5'>
              {recommended.slice(0, 250).map((item) => (
                <Card
                  key={item.id} // Asegúrate de que el key esté en el componente Card
                  id={item.id}
                  title={item.title}
                  rating_score={item.rating_score}
                  rating_count={item.rating_count}
                  time={item.total_time}
                  img_url={item.img_url}
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

export default Index
