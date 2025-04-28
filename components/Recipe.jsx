import React, { useState, useEffect, memo, lazy, Suspense } from 'react'
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa'
import { FaShareFromSquare } from 'react-icons/fa6'
import { MdShoppingCart, MdRemoveShoppingCart } from "react-icons/md"
import Card from './Card'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { CalichefContext } from '../context/MyContext'
import { deviceImages, countryMap } from '../constants'

// Memoized sub-components
const RecipeMetaInfo = memo(({ difficulty, cooking_time, total_time, porciones }) => {
  const difficultyMap = {
    'E': 'Fácil',
    'M': 'Medio',
    'A': 'Avanzado'
  }

  return (
    <div className='py-5'>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center my-2 md:my-6 lg:my-8'>
        <MetaItem 
          icon="icon--chef-hat" 
          label="Difficulty" 
          value={difficultyMap[difficulty] || difficulty} 
        />
        <MetaItem 
          icon="icon--time-preparation" 
          label="Prep. time" 
          value={cooking_time} 
        />
        <MetaItem 
          icon="icon--time-total" 
          label="Total time" 
          value={total_time} 
        />
        <MetaItem 
          icon="icon--servings" 
          label="Portions" 
          value={porciones} 
        />
      </div>
    </div>
  );
});
RecipeMetaInfo.displayName = "RecipeMetaInfo";

// Extract repeating UI patterns into components
const MetaItem = memo(({ icon, label, value }) => (
  <div className='flex flex-col justify-center items-center'>
    <span
      className={`bg-gray-50 rounded-full shadow-md text-green-600 hover:bg-gray-200 hover:text-green-800 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl ${icon}`}
      aria-label={label}
    ></span>
    <span className='font-bold text-base sm:text-lg mt-2'>{label}</span>
    <span className='text-white text-sm sm:text-base'>{value}</span>
  </div>
));
MetaItem.displayName = "MetaItem";

const RatingStars = memo(({ rating_score }) => {
  const rating = rating_score?.toString().split('.') || ['0', '0']
  const rating_integer = parseInt(rating[0]) || 0
  const rating_decimal = parseInt(rating[1]) || 0

  const stars = new Array(5).fill(0)
  stars.fill(1, 0, rating_integer)
  if (rating_decimal >= 5) {
    stars[rating_integer] = 2
  }

  return (
    <div className='flex flex-row mb-6 text-xl'>
      {stars.map((star, index) => (
        <span key={index}>
          <FaStar className={star ? 'text-yellow-500' : 'text-gray-300'} />
        </span>
      ))}
      <span className='ml-2 text-white'>{rating_score}</span>
    </div>
  );
});
RatingStars.displayName = "RatingStars";

const ActionButton = memo(({ icon: Icon, activeIcon: ActiveIcon, isActive, onClick, label }) => (
  <div className='flex flex-col justify-center items-center cursor-pointer'>
    {isActive && ActiveIcon ? (
      <ActiveIcon
        onClick={onClick}
        className='text-red-500 hover:text-red-700 text-3xl sm:text-4xl font-semibold cursor-pointer'
        aria-label={`Remove from ${label.toLowerCase()}`}
      />
    ) : (
      <Icon
        onClick={onClick}
        className='text-white hover:text-gray-500 text-3xl sm:text-4xl font-semibold cursor-pointer'
        aria-label={`Add to ${label.toLowerCase()}`}
      />
    )}
    <span className='text-white text-sm sm:text-base'>{label}</span>
  </div>
));
ActionButton.displayName = "ActionButton";

// Loading fallbacks
const LoadingFallback = () => <div className="p-4 text-white">Loading...</div>;

// Lazy loaded components - these need to be created as separate files
const LazyIngredients = lazy(() => import('./RecipeSections/Ingredients'));
const LazySteps = lazy(() => import('./RecipeSections/Steps'));
const LazyTips = lazy(() => import('./RecipeSections/Tips'));
const LazyNutrition = lazy(() => import('./RecipeSections/Nutrition'));
const LazyUsefulItems = lazy(() => import('./RecipeSections/UsefulItems'));
const LazyDevices = lazy(() => import('./RecipeSections/Devices'));
const LazyCountry = lazy(() => import('./RecipeSections/Country'));
const LazyCollections = lazy(() => import('./RecipeSections/Collections'));
const LazyTags = lazy(() => import('./RecipeSections/Tags'));
const LazyNotes = lazy(() => import('./RecipeSections/Notes'));

// Main Recipe component with optimizations
function Recipe({
  id,
  title,
  img_url,
  tm_versions,
  rating_score,
  difficulty,
  total_time,
  porciones,
  ingredients,
  nutritions,
  devices,
  useful_items,
  steps,
  tags,
  tips,
  recommended,
  category,
  collections,
  country,
  cooking_time,
}) {
  // State management
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState({})
  const [checkedSteps, setCheckedSteps] = useState({})
  const [isInShoppingList, setIsInShoppingList] = useState(false)
  
  // Context hooks
  const { user, updateFavorites, updateShoppingList, isAuthenticated } = useAuth()
  const contextValue = React.useContext(CalichefContext)
  
  // Handle missing context
  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Recipe')
  }
  
  const { shoppingList, fetchShoppingList } = contextValue || { shoppingList: [], fetchShoppingList: () => {} }
  
  // Combined useEffect to reduce render cycles
  useEffect(() => {
    // Check favorites
    if (user?.favorites) {
      setIsFavorite(user.favorites.includes(id));
    } else {
      setIsFavorite(false);
    }

    // Check shopping list
    if (shoppingList) {
      setIsInShoppingList(shoppingList.some(item => item.idRecipe === id));
    }
  }, [id, user, shoppingList]);

  // Handler functions
  const handleShareRecipe = () => {
    const shareData = {
      title: `Receta: ${title}`,
      text: `¡Mira esta receta increíble que encontré! ${title}`,
      url: window.location.href
    }

    if (navigator.share) {
      navigator.share(shareData).catch(error => {
        console.error('Error al compartir:', error)
      })
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Enlace copiado al portapapeles.')
      })
    }
  }

  const handleShoppingList = async () => {
    if (isInShoppingList) {
      await updateShoppingList(id, 'delete');
    } else {
      await updateShoppingList(id, 'add');
    }
    await fetchShoppingList();
  };

  return (
    <main className='bg-black text-white'>
      <div className='page-content flex flex-col max-w-screen-2xl mx-auto px-4'>
        {/* Recipe Header Section */}
        <div className='flex flex-col lg:flex-row h-full'>
          {/* Image Section */}
          <div className='w-full lg:w-1/2 flex justify-center'>
            <Image 
              src={img_url} 
              alt={title}
              width={584} 
              height={480} 
              priority // Mark as priority since it's LCP
              className="block rounded-sm object-cover w-full max-w-lg" 
            />
          </div>

          {/* Recipe Info Section */}
          <div className='flex flex-col bg-black p-4 sm:p-6 lg:p-8 w-full lg:w-1/2'>
            {/* Categories */}
            {category && category.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-4'>
                {category.map((cat, index) => (
                  <span key={index} className='bg-green-700 text-white px-3 py-1 rounded-full text-sm'>
                    {cat}
                  </span>
                ))}
              </div>
            )}
            
            {/* TM Versions */}
            {tm_versions && tm_versions.length > 0 && (
              <div>
                {tm_versions.map(version => (
                  <span key={version} className="inline-block cursor-pointer text-sm font-medium leading-4 px-2 py-1 mr-1 border border-green-500 rounded text-green-500 hover:border-green-700 hover:text-green-700 antialiased">
                    {version.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
            
            {/* Title */}
            <h1 className='text-3xl sm:text-4xl my-6 sm:my-10 font-bold text-white'>
              {title}
            </h1>
            
            {/* Rating */}
            <RatingStars rating_score={rating_score} />

            {/* Action Buttons */}
            <div className='flex flex-row justify-around items-center py-4 sm:py-6'>
              {isAuthenticated && (
                <ActionButton 
                  icon={FaRegHeart}
                  activeIcon={FaHeart}
                  isActive={isFavorite}
                  onClick={() => updateFavorites(id)}
                  label="Favorite"
                />
              )}
              
              <ActionButton 
                icon={FaShareFromSquare}
                onClick={handleShareRecipe}
                label="Share"
              />
              
              <ActionButton 
                icon={MdShoppingCart}
                activeIcon={MdRemoveShoppingCart}
                isActive={isInShoppingList}
                onClick={handleShoppingList}
                label="Add Shopping"
              />
            </div>
          </div>
        </div>
        
        <hr className='separator--silver-60 my-4' />
        
        {/* Recipe Meta Info Section */}
        <RecipeMetaInfo 
          difficulty={difficulty}
          cooking_time={cooking_time}
          total_time={total_time}
          porciones={porciones}
        />
        
        {/* Desktop Layout - Side by side columns */}
        <div className='hidden lg:flex lg:flex-row bg-black'>
          {/* Ingredients Column - Left side */}
          <div className='w-1/2 p-4 text-white'>
            <Suspense fallback={<LoadingFallback />}>
              <LazyIngredients 
                ingredients={ingredients}
                checkedIngredients={checkedIngredients}
                setCheckedIngredients={setCheckedIngredients}
              />
            </Suspense>
            <hr className='separator--silver-60' />
            
            {/* Nutrition Section */}
            {nutritions && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyNutrition nutritions={nutritions} porciones={porciones} />
              </Suspense>
            )}
            
            {/* Devices Section */}
            {devices && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyDevices devices={devices} deviceImages={deviceImages} />
              </Suspense>
            )}
            
            {/* Useful Items Section */}
            {useful_items && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyUsefulItems useful_items={useful_items} />
              </Suspense>
            )}
          </div>
          
          {/* Instructions Column - Right side */}
          <div className='w-1/2 p-4'>
            <Suspense fallback={<LoadingFallback />}>
              <LazySteps 
                steps={steps}
                checkedSteps={checkedSteps}
                setCheckedSteps={setCheckedSteps}
              />
            </Suspense>

            {/* Tips Section */}
            {tips && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyTips tips={tips} />
              </Suspense>
            )}
                                    
            {/* Notes Section - Only for authenticated users */}
            {isAuthenticated && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyNotes recipeId={id} />
              </Suspense>
            )}
            
            
            {/* Country Section */}
            {country && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyCountry country={country} countryMap={countryMap} />
              </Suspense>
            )}
            
            {/* Collections Section */}
            {collections && collections.length > 0 && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyCollections collections={collections} />
              </Suspense>
            )}
            
            {/* Tags Section */}
            {tags && (
              <Suspense fallback={<LoadingFallback />}>
                <LazyTags tags={tags} />
              </Suspense>
            )}
          </div>
        </div>
        
        {/* Mobile Layout - Stacked sections */}
        <div className='lg:hidden bg-black'>
          {/* Ingredients Section */}
          <Suspense fallback={<LoadingFallback />}>
            <div className='p-4 text-white'>
              <LazyIngredients 
                ingredients={ingredients}
                checkedIngredients={checkedIngredients}
                setCheckedIngredients={setCheckedIngredients}
              />
              <hr className='separator--silver-60' />
            </div>
          </Suspense>
          
          {/* Steps Section */}
          <Suspense fallback={<LoadingFallback />}>
            <div className='p-4'>
              <LazySteps 
                steps={steps}
                checkedSteps={checkedSteps}
                setCheckedSteps={setCheckedSteps}
              />
              <hr className='separator--silver-60' />
            </div>
          </Suspense>
          
          {/* Tips Section */}
          {tips && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4'>
                <LazyTips tips={tips} />
              </div>
            </Suspense>
          )}

          {/* Notes Section - Only for authenticated users */}
          {isAuthenticated && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4'>
                <LazyNotes recipeId={id} />
              </div>
            </Suspense>
          )}   
          
          {/* Useful Items Section */}
          {useful_items && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4 text-white'>
                <LazyUsefulItems useful_items={useful_items} />
              </div>
            </Suspense>
          )}
          
          {/* Devices Section */}
          {devices && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4 text-white'>
                <LazyDevices devices={devices} deviceImages={deviceImages} />
              </div>
            </Suspense>
          )}
          
          {/* Country Section */}
          {country && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4'>
                <LazyCountry country={country} countryMap={countryMap} />
              </div>
            </Suspense>
          )}
          
          {/* Collections Section */}
          {collections && collections.length > 0 && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4'>
                <LazyCollections collections={collections} />
              </div>
            </Suspense>
          )}
          
          {/* Tags Section */}
          {tags && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4'>
                <LazyTags tags={tags} />
              </div>
            </Suspense>
          )}
          
          {/* Nutrition Section - At the end for mobile */}
          {nutritions && (
            <Suspense fallback={<LoadingFallback />}>
              <div className='p-4 text-white'>
                <LazyNutrition nutritions={nutritions} />
              </div>
            </Suspense>
          )}
        </div>
      </div>
      
      {/* Recommended Recipes */}
      {recommended && recommended.length > 0 && (
        <Suspense fallback={<LoadingFallback />}>
          <div className='recommended-recipes px-4 sm:px-5 py-6 sm:py-8'>
            <h2 className='text-green-500 text-2xl sm:text-3xl pb-4'>Recetas alternativas</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
              {recommended
                .filter(item => item.id !== id) // Filter out the current recipe
                .filter((item, index, self) => 
                  index === self.findIndex((t) => t.id === item.id) // Filter out duplicates
                )
                .slice(0, 6) // Limit to 6 recommendations
                .map((item) => (
                  <Card
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    rating_score={item.rating_score}
                    rating_count={item.rating_count}
                    time={item.total_time}
                    img_url={item.img_url}
                    category={item.category}
                  />
                ))}
            </div>
          </div>
        </Suspense>
      )}
    </main>
  )
}

export default memo(Recipe);