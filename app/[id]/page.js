'use client'
import { usePathname } from 'next/navigation'
import Recipe from '@/components/Recipe'
import { useEffect, useState, useContext } from 'react'
import Navbar from '@/components/Navbar'
import Head from 'next/head'
import { CalichefContext } from '../../context/MyContext'
import '../globals.css'

const Post = () => {
  // Obtener el id de la receta desde la URL
  const id = usePathname().split('/').pop()

  const [recipe, setRecipe] = useState(null)
  const [recommended, setRecommended] = useState([])

  const contextValue = useContext(CalichefContext)

  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Navbar')
  }

  const { originalData } = contextValue

  useEffect(() => {
    if (id && originalData) {
      const recipe = originalData.find(item => item.id === id)
      if (recipe) {
        const idRecommended = recipe.recommended || []

        const recommended = originalData.filter(item =>
          idRecommended.includes(item.id)
        )

        // ordenar por rating_score
        recommended.sort((a, b) => b.rating_score - a.rating_score)

        // crear objeto con los datos de la receta
        const recipeDetails = {
          id: recipe.id,
          title: recipe.title,
          img_url: recipe.image_url,
          tm_versions: recipe.tm_versions,
          rating_score: recipe.rating_score,
          rating_count: recipe.rating_count,
          difficulty: recipe.Dificultad,
          cooking_time: recipe.cooking_time,
          total_time: recipe.total_time,
          porciones: recipe.Porciones,
          ingredients: recipe.ingredients,
          nutritions: recipe.nutritions,
          steps: recipe.steps,
          tags: recipe.tags,
          tips: recipe.tips,
          recommended: recipe.recommended,
          category: recipe.category,
          collections: recipe.collections,
          country: recipe.country,
          language: recipe.language
        }
        setRecipe(recipeDetails)

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
      } else {
        console.error(`Receta con id ${id} no encontrada`)
      }
    }
  }, [id, originalData])

  return (
    <>
      <Head>
        <link rel='icon' href='/favicon2.ico' />
        <title>{recipe?.title} - Calichef</title>
        <meta name='description' content={`${recipe?.title} Recipe`} />
        <meta property='og:description' content={`${recipe?.title} Recipe`} />
        {/* Puedes agregar más metadatos aquí según tus necesidades */}
      </Head>
      <Navbar />
      <div className='container w-full mx-auto py-5 px-4'>
        {recipe ? (
          <Recipe
            id={recipe.id}
            title={recipe.title}
            img_url={recipe.img_url}
            tm_versions={recipe.tm_versions}
            rating_score={recipe.rating_score}
            rating_count={recipe.rating_count}
            difficulty={recipe.difficulty}
            cooking_time={recipe.cooking_time}
            total_time={recipe.total_time}
            porciones={recipe.porciones}
            ingredients={recipe.ingredients}
            nutritions={recipe.nutritions}
            steps={recipe.steps}
            tags={recipe.tags}
            tips={recipe.tips}
            recommended={recommended}
          />
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

export default Post
