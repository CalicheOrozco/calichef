'use client'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useContext, useMemo } from 'react'
import { FaArrowLeft } from "react-icons/fa6"
import Head from 'next/head'

import Recipe from '@/components/Recipe'
import Navbar from '@/components/Navbar'
import { CalichefContext } from '../../context/MyContext'
import '../globals.css'

const Post = () => {
  const pathname = usePathname()
  const id = useMemo(() => pathname.split('/').pop(), [pathname])
  const router = useRouter()
  const [recipeData, setRecipeData] = useState({ recipe: null, recommended: [] })
  const [recipeNotFound, setRecipeNotFound] = useState(false)
  const { originalData, loadingData } = useContext(CalichefContext) || { originalData: null, loadingData: true }

  useEffect(() => {
    if (!id || !originalData || loadingData) return

    const recipe = originalData.find(item => item.id === id)
    if (!recipe) {
      setRecipeNotFound(true)
      return
    }

    setRecipeNotFound(false)

    // Extraer recomendaciones
    const idRecommended = recipe.recommended || []
    const recommendedItems = originalData
      .filter(item => idRecommended.includes(item.id))
      .sort((a, b) => b.rating_score - a.rating_score)
      .map(item => ({
        id: item.id,
        title: item.title,
        rating_score: item.rating_score,
        rating_count: item.rating_count,
        time: item.total_time,
        img_url: item.image_url
      }))

    // Crear objeto con los datos de la receta
    const recipeDetails = {
      id: recipe.id,
      title: recipe.title,
      img_url: recipe.image_url,
      tm_versions: recipe.tm_versions,
      rating_score: recipe.rating_score,
      rating_count: recipe.rating_count,
      difficulty: recipe.difficulty,
      cooking_time: recipe.cooking_time,
      total_time: recipe.total_time,
      porciones: recipe.porciones,
      ingredients: recipe.ingredients,
      nutritions: recipe.nutritions,
      steps: recipe.steps,
      tags: recipe.tags,
      tips: recipe.tips,
      recommended: recipe.recommended,
      category: recipe.category,
      collections: recipe.collections,
      country: recipe.country,
      language: recipe.language,
      devices: recipe.devices,
      useful_items: recipe.useful_items
    }

    setRecipeData({
      recipe: recipeDetails,
      recommended: recommendedItems
    })
  }, [id, originalData])

  const { recipe, recommended } = recipeData

  // Separamos la lógica de renderizado para mayor claridad
  const renderLoader = () => (
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
          />
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a 8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          />
        </svg>
        <p className='mt-4 text-lg text-gray-600'>Loading...</p>
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon2.ico' />
        <title>{recipe?.title ? `${recipe.title} - Calichef` : 'Calichef'}</title>
        {recipe && (
          <>
            <meta name='description' content={`${recipe.title} Recipe`} />
            <meta property='og:description' content={`${recipe.title} Recipe`} />
          </>
        )}
      </Head>
      
      <Navbar />
      
      <div className='container w-full mx-auto py-5 px-4'>
        <div className="text-center">
          <div className="text-white text-4xl lg:text-5xl md:py-2 lg:pl-4 hover:text-green-500 flex items-center cursor-pointer">
            <FaArrowLeft 
              onClick={() => router.back()}
              className="mr-2 mb-4" 
              aria-label="Volver atrás"
            />
          </div>
        </div>
        
        {recipe ? (
          <Recipe
            {...recipe}
            recommended={recommended}
          />
        ) : recipeNotFound && !loadingData ? (
          <div className='flex justify-center items-center h-[60vh]'>
            <p className='text-lg text-gray-600'>Receta no encontrada.</p>
          </div>
        ) : renderLoader()}
      </div>
    </>
  )
}

export default Post