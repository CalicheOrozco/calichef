'use client'
import { memo } from 'react'
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { openDB } from 'idb'
import { useAuth } from '@/context/AuthContext'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

const Card = memo(function Card({ 
  title, 
  rating_score, 
  rating_count, 
  time, 
  img_url, 
  id, 
  category, 
  isCollection = false 
}) {
  const { user, updateFavorites, updateFavoriteCollections, isAuthenticated } = useAuth()
  const cardId = id

  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  // Efecto optimizado para verificar el estado de favoritos
  useEffect(() => {
    if (user) {
      const favoriteCollections = user?.favoriteCollections || []
      const favorites = user?.favorites || []

      if (isCollection) {
        setIsFavorite(favoriteCollections.includes(cardId))
      } else {
        const isInFavorites = favorites.includes(cardId)
        setIsFavorite(isInFavorites)
        setIsSaved(isInFavorites)
      }
    }
  }, [cardId, user, isCollection])

  // Función para gestionar acciones con recetas (optimizada)
  const handleRecipeAction = useCallback(async (action) => {
    try {
      const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME)
          }
        }
      })
  
      const favoriteCollections = user?.favoriteCollections || []
      const favorites = user?.favorites || []
      
      if (isCollection) {
        const updatedCollections = action === 'save'
          ? [...favoriteCollections, cardId]
          : favoriteCollections.filter(collectionId => collectionId !== cardId)
        
        await db.put(STORE_NAME, updatedCollections, 'favoriteCollections')
        setIsFavorite(action === 'save')
      } else {
        const updatedFavorites = action === 'save'
          ? [...favorites, cardId]
          : favorites.filter(recipeId => recipeId !== cardId)
        
        await db.put(STORE_NAME, updatedFavorites, 'favorites')
        setIsFavorite(action === 'save')
        setIsSaved(action === 'save')
      }
    } catch (error) {
      console.error(`Error al ${action === 'save' ? 'guardar' : 'eliminar'} la receta:`, error)
    }
  }, [cardId, user, isCollection])

  // Optimizado para usar menos re-renderizados
  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation()
    if (isCollection) {
      updateFavoriteCollections(cardId)
    } else {
      updateFavorites(cardId)
    }
    setIsFavorite(prev => !prev)
  }, [cardId, isCollection, updateFavorites, updateFavoriteCollections])

  const handleHeartClick = useCallback((e) => {
    e.stopPropagation()
    handleRecipeAction(isSaved ? 'delete' : 'save')
  }, [isSaved, handleRecipeAction])

  // Función para renderizar estrellas durante el renderizado (más eficiente)
  const renderStars = () => {
    if (rating_score === undefined || rating_score === null) return []
    
    const stars = []
    const [integer, decimal] = rating_score.toString().split('.')
    const rating_integer = parseInt(integer)
    const rating_decimal = parseInt(decimal || '0')
    
    for (let i = 0; i < 5; i++) {
      if (i < rating_integer) {
        stars.push(1)
      } else if (i === rating_integer && rating_decimal >= 5) {
        stars.push(2)
      } else {
        stars.push(0)
      }
    }
    
    return stars
  }

  return (
    <div className={`relative bg-neutral-800 rounded-lg shadow-lg overflow-hidden ${
      isCollection ? 'w-[240px] h-[330px]' : 'h-[380px] w-[347px]'
    } mx-auto transform transition duration-300 md:hover:scale-105 cursor-pointer md:hover:shadow-2xl border border-neutral-700`}>
      <div className='relative'>
        <Link href={`/${isCollection ? `collections/${cardId}` : cardId}`} passHref>
          {isCollection ? (
            <div className="w-full h-60 flex items-center justify-center bg-neutral-800">
              <Image
                src={img_url}
                alt={title}
                width={240}
                height={240}
                className="object-cover rounded-t-lg"
              />
            </div>
          ) : (
            <img src={img_url} alt={title} className="w-full h-60 object-cover" />
          )}
        </Link>
        <div className='absolute top-2 right-2 text-4xl'>
          {isAuthenticated ? (
            isFavorite ? (
              <FaHeart
                onClick={handleFavoriteClick}
                className='text-red-500 hover:text-red-700 cursor-pointer'
              />
            ) : (
              <FaRegHeart
                onClick={handleFavoriteClick}
                className='text-white hover:text-gray-500 cursor-pointer'
              />
            )
          ) : (
            isSaved ? (
              <FaHeart
                className='text-red-500 cursor-pointer'
                onClick={handleHeartClick}
                onMouseEnter={e => e.currentTarget.style.color = 'gray'}
                onMouseLeave={e => e.currentTarget.style.color = 'red'}
              />
            ) : (
              <FaRegHeart
                className='text-gray-500 cursor-pointer'
                onClick={handleHeartClick}
                onMouseEnter={e => e.currentTarget.style.color = 'red'}
                onMouseLeave={e => e.currentTarget.style.color = 'gray'}
              />
            )
          )}
        </div>
      </div>
      <Link href={`/${cardId}`} className='block'>
        <div className='p-4'>
          <h2 className='text-lg font-semibold mb-2 line-clamp-2 text-white'>{title}</h2>
          <div className='flex items-center justify-between'>
            {rating_score !== undefined && rating_score !== null && (
              <div className='flex items-center'>
                {renderStars().map((star, index) => (
                  <span key={index}>
                    <FaStar className={star > 0 ? 'text-yellow-500' : 'text-gray-300'} />
                  </span>
                ))}
                <span className='ml-2 text-gray-400'>{rating_score}</span>
                <span className='ml-2 text-gray-400'>({rating_count || 0})</span>
              </div>
            )}
            <div className='text-gray-400'>{time}</div>
          </div>
          {!isCollection && (
            <div className='text-gray-400 pt-4'>
              {Array.isArray(category) ? category.join(', ') : category}
            </div>
          )}
        </div>
        {!isCollection && (
          <div className='flex items-center justify-end pr-4 pb-4'>
            <i className='fas fa-ellipsis-v'></i>
          </div>
        )}
      </Link>
    </div>
  )
}, (prevProps, nextProps) => {
  // Optimización de comparación para memo
  return prevProps.id === nextProps.id && prevProps.img_url === nextProps.img_url
})

export default Card