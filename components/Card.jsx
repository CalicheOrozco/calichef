import { FaStar, FaStarHalf, FaHeart, FaRegHeart } from 'react-icons/fa'
import Link from 'next/link'
import { CalichefContext } from '../context/MyContext'
import { useContext, useEffect, useState } from 'react'
import { openDB } from 'idb'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

function Card ({ title, rating_score, rating_count, time, img_url, id, category }) {
  const contextValue = useContext(CalichefContext)

  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Navbar')
  }

  const { setUserRecipes } = contextValue

  // Separar el rating_score en dos partes
  const rating = rating_score.toString().split('.')
  const rating_integer = parseInt(rating[0])
  const rating_decimal = parseInt(rating[1])
  // Crear un array con 5 elementos
  const stars = new Array(5).fill(0)
  // Llenar las estrellas completas
  stars.fill(1, 0, rating_integer)
  // Llenar la estrella decimal
  if (rating_decimal >= 5) {
    stars[rating_integer] = 2
  }

  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const db = await openDB(DB_NAME, 1)
        let currentRecipes = (await db.get(STORE_NAME, 'userRecipes')) || []
        setIsSaved(currentRecipes.includes(id))
      } catch (error) {
        console.error('Error al comprobar si la receta está guardada:', error)
      }
    }

    checkIfSaved()
  }, [id])

  const handleSaveRecipe = async () => {
    try {
      const db = await openDB(DB_NAME, 1, {
        upgrade (db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME)
          }
        }
      })

      let currentRecipes = (await db.get(STORE_NAME, 'userRecipes')) || []
      if (!currentRecipes.includes(id)) {
        currentRecipes.push(id)
        await db.put(STORE_NAME, currentRecipes, 'userRecipes')
        setUserRecipes(currentRecipes)
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error al guardar la receta:', error)
    }
  }

  const handleDeleteRecipe = async () => {
    try {
      const db = await openDB(DB_NAME, 1, {
        upgrade (db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME)
          }
        }
      })

      let currentRecipes = (await db.get(STORE_NAME, 'userRecipes')) || []
      if (currentRecipes.includes(id)) {
        currentRecipes = currentRecipes.filter(recipeId => recipeId !== id)
        await db.put(STORE_NAME, currentRecipes, 'userRecipes')
        setUserRecipes(currentRecipes)
        setIsSaved(false)
      }
    } catch (error) {
      console.error('Error al eliminar la receta:', error)
    }
  }

  return (
    <div className='relative bg-neutral-800 rounded-lg shadow-lg overflow-hidden w-[347px] h-[380px] mx-auto transform transition duration-300 md:hover:scale-105 cursor-pointer md:hover:shadow-2xl border border-neutral-700'>
      <div className='relative'>
        <Link href={`/${id}`} passHref>
          <img src={img_url} alt={title} className='w-full h-60 object-cover' />
        </Link>
        <div className='absolute top-2 right-2 text-4xl'>
          {isSaved ? (
            <FaHeart
              className='text-red-500 cursor-pointer'
              onClick={e => {
                e.stopPropagation()
                handleDeleteRecipe()
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'gray'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'red'
              }}
            />
          ) : (
            <FaRegHeart
              className='text-gray-500 cursor-pointer'
              onClick={e => {
                e.stopPropagation()
                handleSaveRecipe()
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'red'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'gray'
              }}
            />
          )}
        </div>
      </div>
      <Link href={`/${id}`} className='block'>
        <div className='p-4'>
          <h2 className='text-lg font-semibold mb-2 line-clamp-2 text-white'>{title}</h2>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              {stars.map((star, index) => (
                <span key={index}>
                  {star === 1 ? (
                    <FaStar className='text-yellow-500' />
                  ) : star === 2 ? (
                    <FaStarHalf className='text-yellow-500' />
                  ) : (
                    <FaStar className='text-gray-300' />
                  )}
                </span>
              ))}
              <span className='ml-2 text-gray-400'>{rating_score}</span>
              <span className='ml-2 text-gray-400'>({rating_count})</span>
            </div>
            <div className='text-gray-400'>{time}</div>
          </div>
          <div className='text-gray-400 pt-4'>
            {Array.isArray(category) ? category.join(', ') : category}
          </div>
        </div>
        <div className='flex items-center justify-end pr-4 pb-4'>
          <i className='fas fa-ellipsis-v'></i>
        </div>
      </Link>
    </div>
  )
}

export default Card
