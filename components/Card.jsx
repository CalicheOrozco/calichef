'use client'
import { memo } from 'react'
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { openDB } from 'idb'
import { useAuth } from '@/context/AuthContext'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

const Card = memo(function Card({ title, rating_score, rating_count, time, img_url, id, category, isCollection = false }) {
  const { user, updateFavorites, updateFavoriteCollections, isAuthenticated } = useAuth()

  const cardId = id

  const stars = useMemo(() => {
    if (rating_score === undefined || rating_score === null) return []

    const [integer, decimal] = rating_score.toString().split('.')
    const rating_integer = parseInt(integer)
    const rating_decimal = parseInt(decimal || '0')

    const stars = new Array(5).fill(0)
    stars.fill(1, 0, rating_integer)
    if (rating_decimal >= 5) stars[rating_integer] = 2

    return stars
  }, [rating_score])

  const [isSaved, setIsSaved] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFavoriteCollection, setIsFavoriteCollection] = useState(false)

  useEffect(() => {

   

    const favoriteCollections = user?.favoriteCollections || []
    const favorites = user?.favorites || []

    // verificar si es una colección
    if (isCollection) {
      // checar si la colección está en favoritos
      setIsFavoriteCollection(favoriteCollections.includes(cardId))
      if (favoriteCollections.includes(cardId)) {
        setIsFavorite(true)
      }
    } else {
      // checar si la receta está en favoritos
      setIsFavorite(favorites.includes(cardId))
      if (favorites.includes(cardId)) {
        setIsSaved(true)
      }
    }

    
   

  }, [cardId, user, isCollection])

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
      
  
      // validar si es una colección
      if (isCollection) {
        
        if (action ==='save' && !favoriteCollections.includes(cardId)) {
          const updatedCollections = [...favoriteCollections, cardId]
          await db.put(STORE_NAME, updatedCollections, 'favoriteCollections')
          setIsFavoriteCollection(true)
        } else if (action === 'delete' && favoriteCollections.includes(cardId)) {
          const updatedCollections = favoriteCollections.filter(collectionId => collectionId!== cardId)
          await db.put(STORE_NAME, updatedCollections, 'favoriteCollections')
          setIsFavoriteCollection(false)
        }
      } else {
        console.log('el card id es: ', cardId)
        if (action ==='save' &&!favorites.includes(cardId)) {
          const updatedFavorites = [...favorites, cardId]
          await db.put(STORE_NAME, updatedFavorites, 'favorites')
          setIsFavorite(true)
          setIsSaved(true)
        } else if (action === 'delete' && favorites.includes(cardId)) {
          const updatedFavorites = favorites.filter(recipeId => recipeId!== cardId)
          await db.put(STORE_NAME, updatedFavorites, 'favorites')
          setIsFavorite(false)
          setIsSaved(false)
        }
      }
  
      
    } catch (error) {
      console.error(`Error al ${action === 'save' ? 'guardar' : 'eliminar'} la receta:`, error)
    }
  }, [cardId])

  const handleFavoriteClick = useCallback(() => {
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

  const CardImage = useMemo(() => (
    isCollection ? (
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
    )
  ), [img_url, title, isCollection])

  const RatingStars = useMemo(() => (
    rating_score !== undefined && rating_score !== null ? (
      <div className='flex items-center'>
        {stars.map((star, index) => (
          <span key={index}>
            <FaStar className={star === 1 || star === 2 ? 'text-yellow-500' : 'text-gray-300'} />
          </span>
        ))}
        <span className='ml-2 text-gray-400'>{rating_score}</span>
        <span className='ml-2 text-gray-400'>({rating_count || 0})</span>
      </div>
    ) : <div />
  ), [stars, rating_score, rating_count])

  return useMemo(() => (
    <div className={`relative bg-neutral-800 rounded-lg shadow-lg overflow-hidden ${isCollection ? 'w-[240px] h-[330px]' : 'h-[380px] w-[347px]'} mx-auto transform transition duration-300 md:hover:scale-105 cursor-pointer md:hover:shadow-2xl border border-neutral-700`}>
      <div className='relative'>
        <Link href={`/${isCollection ? `collections/${cardId}` : cardId}`} passHref>
          {CardImage}
        </Link>
        <div className='absolute top-2 right-2 text-4xl'>
          {isAuthenticated ? (
            isFavorite ? (
              <FaHeart
                onClick={handleFavoriteClick}
                className='text-red-500 hover:text-red-700'
              />
            ) : (
              <FaRegHeart
                onClick={handleFavoriteClick}
                className='text-white hover:text-gray-500'
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
            {RatingStars}
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
  ), [cardId, isSaved, isFavorite, isAuthenticated, CardImage, RatingStars, title, time, category, isCollection, handleFavoriteClick, handleHeartClick])
}, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.rating_score === nextProps.rating_score &&
    prevProps.rating_count === nextProps.rating_count &&
    prevProps.time === nextProps.time &&
    prevProps.img_url === nextProps.img_url &&
    prevProps.id === nextProps.id &&
    prevProps.category === nextProps.category &&
    prevProps.isCollection
 === nextProps.isCollection
  )
})

export default Card
