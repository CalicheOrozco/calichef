import React, { useContext, useState, useEffect } from 'react'
import { FaStar } from 'react-icons/fa'
import { CalichefContext } from '../context/MyContext'
import { FaShareFromSquare } from 'react-icons/fa6'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { MdShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import Card from './Card'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

import { deviceImages, countryMap } from '../constants';


export default function Recipe({
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
  const [isFavorite, setIsFavorite] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState({})
  const [checkedSteps, setCheckedSteps] = useState({})
  const { user, updateFavorites, updateShoppingList , isAuthenticated} = useAuth()
  const { fetchShoppingList } = useContext(CalichefContext);

  const difficultyMap = {
    'E': 'Fácil',
    'M': 'Medio',
    'A': 'Avanzado'
  }

  const rating = rating_score?.toString().split('.') || ['0', '0']
  const rating_integer = parseInt(rating[0]) || 0
  const rating_decimal = parseInt(rating[1]) || 0

  const stars = new Array(5).fill(0)
  stars.fill(1, 0, rating_integer)
  if (rating_decimal >= 5) {
    stars[rating_integer] = 2
  }

  const contextValue = useContext(CalichefContext)
  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Recipe')
  }

  const { shoppingList } = contextValue

  const [isInShoppingList, setIsInShoppingList] = useState(() => {
    return shoppingList ? shoppingList.some(item => item.idRecipe === id) : false;
  });

  useEffect(() => {
    // Verificar si la receta está en favoritos del usuario
    if (user && user.favorites) {
      setIsFavorite(user.favorites.includes(id));
    } else {
      setIsFavorite(false);
    }

    // Verificar si la receta está en la lista de compras
    if (shoppingList) {
      // verificar si la receta está en la lista de compras
      const isInList = shoppingList.some(item => item.idRecipe === id);
      setIsInShoppingList(isInList);
    } 
  }, [id, user, shoppingList]);


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

  // Renderiza las secciones del contenido según el orden requerido para móviles
  const renderIngredientsSection = () => (
    <div className='pb-5'>
      <h3 className='text-white text-xl sm:text-2xl pb-5'>
        Ingredientes
      </h3>
      <core-list-section>
        <ul className='space-y-4'>
          {ingredients && typeof ingredients === 'object' ? 
            Object.entries(ingredients).map(([group, items]) => (
              <div key={group}>
                {group !== 'Sin título' && <h4 className="text-white font-semibold mt-3 mb-2">{group}</h4>}
                {Array.isArray(items) && items.map((ingredient, index) => {
                  // Procesar el nombre del ingrediente
                  let processedName = ingredient.name;
                  if (processedName.startsWith('de ')) {
                    processedName = processedName.slice(3);
                  }
                  processedName = processedName.charAt(0).toUpperCase() + processedName.slice(1);
                  
                  const ingredientId = `${group}-${index}`;
                  const isChecked = checkedIngredients[ingredientId] || false;
                  
                  const toggleIngredient = () => {
                    setCheckedIngredients(prev => ({
                      ...prev,
                      [ingredientId]: !isChecked
                    }));
                  };
                  
                  return (
                    <li 
                      key={ingredientId} 
                      className='flex items-center justify-between py-2 px-2 sm:px-4 rounded-lg hover:bg-neutral-800 cursor-pointer'
                      onClick={toggleIngredient}
                    >
                      <div className='flex items-center gap-2 sm:gap-3'>
                        {ingredient.image && 
                          <div className='w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center'>
                            <Image 
                              src={ingredient.image} 
                              alt={processedName} 
                              width={40}
                              height={40}
                              className={`object-cover ${isChecked ? 'opacity-50' : ''}`}
                            />
                          </div>
                        }
                        <div>
                          <span className={`text-white text-sm sm:text-base ${isChecked ? 'line-through text-gray-500' : ''}`}>
                            {processedName}
                          </span>
                          {ingredient.description && 
                            <span className={`text-gray-400 text-xs sm:text-sm block ${isChecked ? 'line-through opacity-50' : ''}`}>
                              {ingredient.description}
                            </span>
                          }
                        </div>
                      </div>
                      {ingredient.amount && 
                        <span className={`text-gray-300 text-xs sm:text-sm ${isChecked ? 'line-through opacity-50' : ''}`}>
                          {ingredient.amount}
                        </span>
                      }
                    </li>
                  );
                })}
              </div>
            ))
          : null}
        </ul>
      </core-list-section>
    </div>
  );

  const renderStepsSection = () => (
    steps && (
      <div>
        <core-list-section>
          <h3 className='text-white text-xl sm:text-2xl pb-4 sm:pb-8'>
            Preparación
          </h3>
          <ol className='space-y-3 sm:space-y-4'>
            {steps?.map((step, index) => {
              const stepId = `step-${index}`;
              const isChecked = checkedSteps[stepId] || false;
              
              const toggleStep = () => {
                setCheckedSteps(prev => ({
                  ...prev,
                  [stepId]: !isChecked
                }));
              };
              
              return (
                <li 
                  key={`preparation-step-${index}`}
                  className='py-2 px-3 sm:px-4 rounded-lg hover:bg-neutral-800 cursor-pointer'
                  onClick={toggleStep}
                >
                  <div className='preparation-step-number'>
                    <span className={`${isChecked ? 'line-through text-gray-500' : 'text-green-500'}`}>{index + 1}</span>
                  </div>
                  <span className={`text-sm sm:text-base ${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>{step}</span>
                </li>
              );
            })}
          </ol>
        </core-list-section>
      </div>
    )
  );

  const renderTipsSection = () => (
    tips && (
      <>
        <div className='py-4 sm:py-8 text-white'>
          <h3 className='text-white text-xl sm:text-2xl pb-4 sm:pb-8'>
            Sugerencias y consejos
          </h3>
          <ul className='flex flex-col sm:flex-row flex-wrap gap-2 mb-4'>
            {tips?.map((tip, index) => (
              <li key={`hint-and-trick-${index}`} className="text-sm sm:text-base mb-2">
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <hr className='separator--silver-60' />
      </>
    )
  );

  const renderUsefulItemsSection = () => (
    useful_items && (
      <div>
        <div className='nutritions pb-5'>
          <div className='bg-black bg-opacity-80 p-4 sm:p-6 rounded-lg'>
            <h3 className='text-xl sm:text-2xl text-white font-bold mb-2'>Accesorios útiles</h3>
            <div className='space-y-2 sm:space-y-4'>
              {useful_items?.map((item, index) => (
                <div key={index} className='flex items-center'>
                  <span className='text-base sm:text-lg capitalize'>- {item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <hr className='separator--silver-60' />
      </div>
    )
  );

  const renderDevicesSection = () => (
    devices && (
      <div>
        <div className='nutritions pb-5'>
          <div className='bg-black bg-opacity-80 p-4 sm:p-6 rounded-lg'>
            <h3 className='text-xl sm:text-2xl text-white font-bold mb-2'>Dispositivos y accesorios</h3>
            <div className='space-y-3 sm:space-y-4'>
              {devices?.map((item, index) => (
                <div key={index} className='flex items-center'>
                  <Image
                    src={deviceImages[item] || 'https://assets.tmecosys.com/image/upload/t_web_ingredient_48x48_2x/icons/ingredient_icons/546'}
                    alt={item}
                    width={40}
                    height={40}
                    className="sm:w-[60px] sm:h-[60px]"
                  />
                  <span className='text-base sm:text-lg capitalize ml-2'>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <hr className='separator--silver-60' />
      </div>
    )
  );

  const renderCountrySection = () => (
    country && (
      <>
        <div className='py-4 sm:py-8 text-white'>
          <h3 className='text-white text-xl sm:text-2xl pb-4 sm:pb-8'>
            País
          </h3>
          <ul className='flex list-none flex-row justify-start items-center flex-wrap gap-2'>
            {country?.map((item, index) => (
              <li key={index} className='flex flex-col items-center'>
                <Image className='pb-2' src={countryMap[`${item}img`]} alt={item} width={30} height={30} />
                <span className="text-sm sm:text-base">{countryMap[item]}</span>
              </li>
            ))}
          </ul>
        </div>
        <hr className='separator--silver-60' />
      </>
    )
  );

  const renderCollectionsSection = () => (
    collections && collections.length > 0 && (
      <>
        <div className='py-4 sm:py-8 text-white'>
          <h3 className='text-white text-xl sm:text-2xl font-bold pb-4 sm:pb-8'>
            También incluido en
          </h3>
          <div className='flex flex-col space-y-3 sm:space-y-4'>
            {collections.map((collection, index) => (
              <a 
                key={index} 
                href={`/collections/${collection.id}`}
                className='block'
              >
                <div className='flex items-center bg-neutral-900 p-2 sm:p-3 rounded-lg hover:bg-neutral-800'>
                  <div className='w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4 flex-shrink-0'>
                    <Image 
                      src={collection.image_url} 
                      alt={collection.name} 
                      width={80} 
                      height={80} 
                      className='rounded-md object-cover'
                    />
                  </div>
                  <div className='flex flex-col'>
                    <h4 className='text-base sm:text-lg font-semibold text-white'>{collection.name}</h4>
                    <p className='text-gray-400 text-xs sm:text-sm'>
                      {collection.info ? 
                        collection.info.replace(/(.*?)(Recipes|Recetas|Recettes).*$/g, '$1$2')
                        : ''}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <hr className='separator--silver-60' />
      </>
    )
  );

  const renderTagsSection = () => (
    tags && (
      <div className='py-4 sm:py-8'>
        <h3 className='text-white text-xl sm:text-2xl font-bold pb-4 sm:pb-8'>
          Etiquetas
        </h3>
        <div className='py-3 sm:py-6 flex flex-wrap gap-2 sm:gap-4'>
          {tags?.map((tag, index) => (
            <a
              key={`additional-category-${index}`}
              className='py-2 px-3 sm:py-3 sm:px-4 bg-white text-green-600 text-sm sm:text-base'
            >
              {`#${tag}`}
            </a>
          ))}
        </div>
        <hr className='separator--silver-60' />
      </div>
    )
  );

  const renderNutritionSection = () => (
    nutritions && (
      <div>
        <div className='nutritions pb-5'>
          <div className='bg-black bg-opacity-80 p-4 sm:p-6 rounded-lg'>
            <h3 className='text-xl sm:text-2xl font-bold text-white mb-2'>Nutrition</h3>
            <p className='text-gray-400 mb-4'>per 1 porción</p>
            
            <div className='space-y-3 sm:space-y-4'>
              {nutritions?.map((item, index) => (
                <div key={index} className='flex justify-between items-center border-b border-gray-700 pb-2'>
                  <span className='text-base sm:text-lg capitalize'>{item.name}</span>
                  <span className='text-base sm:text-lg text-gray-300'>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Additional Nutrition Info */}
        <div className='pb-5 mt-6'>
          <dl>
            <dd>{nutritions?.inf_nutricional}</dd>
            {nutritions?.calorias && (
              <>
                <dt className='text-white font-bold'>Calorías</dt>
                <dd>{nutritions?.calorias}</dd>
              </>
            )}
            {nutritions?.proteina && (
              <>
                <dt className='text-white font-bold'>Proteína</dt>
                <dd>{nutritions?.proteina}</dd>
              </>
            )}
            {nutritions?.carbohidratos && (
              <>
                <dt className='text-white font-bold'>Carbohidratos</dt>
                <dd>{nutritions?.carbohidratos}</dd>
              </>
            )}
            {nutritions?.grasa && (
              <>
                <dt className='text-white font-bold'>Grasa</dt>
                <dd>{nutritions?.grasa}</dd>
              </>
            )}
            {nutritions?.grasa_saturada && (
              <>
                <dt className='text-white font-bold'>Grasa Saturada</dt>
                <dd>{nutritions?.grasa_saturada}</dd>
              </>
            )}
            {nutritions?.fibra && (
              <>
                <dt className='text-white font-bold'>Fibra</dt>
                <dd>{nutritions?.fibra}</dd>
              </>
            )}
          </dl>
        </div>
        <hr className='separator--silver-60' />
      </div>
    )
  );

  const renderRecommendedSection = () => (
    recommended && (
      <div className='recommended-recipes px-4 sm:px-5 py-6 sm:py-8'>
        <h2 className='text-white text-2xl sm:text-3xl pb-4'>Recetas alternativas</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4 sm:gap-6'>
          {recommended
            .filter(item => item.id !== id) // Filter out the current recipe
            .filter((item, index, self) => 
              index === self.findIndex((t) => t.id === item.id) // Filter out duplicates
            )
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
    )
  );

  return (
    <main className='bg-black text-white'>
      <div className='page-content flex flex-col max-w-screen-2xl mx-auto px-4'>
        
        <div>
          <div>
            <div className='flex flex-col lg:flex-row h-full'>
              {/* Image and Info Section - Stacks vertically on mobile, side by side on larger screens */}
              <div className='w-full lg:w-1/2 flex justify-center'>
                <Image
                  src={img_url}
                  alt={title}
                  title={title}
                  width={600}
                  height={300}
                  priority
                  className="block rounded-sm object-cover w-full max-w-lg"
                />
              </div>
  
              {/* Recipe Info Section */}
              <div className='flex flex-col bg-black p-4 sm:p-6 lg:p-8 w-full lg:w-1/2'>
                {category && (
                  <div className='flex flex-wrap gap-2 mb-4'>
                    {category.map((cat, index) => (
                      <span key={index} className='bg-green-700 text-white px-3 py-1 rounded-full text-sm'>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <div>
                  {tm_versions?.map(version => (
                    <span key={version} className="inline-block cursor-pointer text-sm font-medium leading-4 px-2 py-1 mr-1 border border-green-500 rounded text-green-500 hover:border-green-700 hover:text-green-700 antialiased">
                      {version.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                <h1 className='text-3xl sm:text-4xl my-6 sm:my-10 font-bold text-white'>
                  {title}
                </h1>
  
                <div className='flex flex-row mb-6 text-xl'>
                  {stars.map((star, index) => (
                    <span key={index}>
                      {star === 1 || star === 2 ? (
                        <FaStar className='text-yellow-500' />
                      ) : (
                        <FaStar className='text-gray-300' />
                      )}
                    </span>
                  ))}
                  <span className='ml-2 text-white'>{rating_score}</span>
                </div>
  
                {/* Action Buttons - More compact on mobile */}
                <div className='flex flex-row justify-around items-center py-4 sm:py-6'>
                  {isAuthenticated && (
                    <div className='flex flex-col justify-center items-center cursor-pointer'>
                      {isFavorite ? (
                        <FaHeart
                          onClick={() => updateFavorites(id)}
                          className='text-red-500 hover:text-red-700 text-3xl sm:text-4xl font-semibold cursor-pointer'
                        />
                      ) : (
                        <FaRegHeart
                          onClick={() => updateFavorites(id)}
                          className='text-white hover:text-gray-500 text-3xl sm:text-4xl font-semibold cursor-pointer'
                        />
                      )}
                      <span className='text-white text-sm sm:text-base'>Favorito</span>
                    </div>
                  )}
                  <div className='flex flex-col justify-center items-center'>
                    <FaShareFromSquare
                      onClick={handleShareRecipe}
                      className='text-white hover:text-gray-500 text-3xl sm:text-4xl font-semibold cursor-pointer'
                    />
                    <span className='text-white text-sm sm:text-base'>Compartir</span>
                  </div>
                  <div className='flex flex-col justify-center items-center'>
                  {
                    isInShoppingList ? (
                      <MdRemoveShoppingCart
                        onClick={handleShoppingList}
                        className='text-red-500 hover:text-red-700 text-3xl sm:text-4xl font-semibold cursor-pointer'
                      />
                    ) : (
                      <MdShoppingCart
                        onClick={handleShoppingList}
                        className='text-white hover:text-gray-500 text-3xl sm:text-4xl font-semibold cursor-pointer'
                      />
                    )
                  }
                    <span className='text-white text-sm sm:text-base'>Add Shopping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Recipe Meta Info Section - More compact grid on smaller screens */}
        <div className='py-5'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center my-2 md:my-6 lg:my-8'>
            <div className='flex flex-col justify-center items-center'>
              <span
                className='bg-gray-50 rounded-full shadow-md text-green-600 hover:bg-gray-200 hover:text-green-800 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl icon--chef-hat'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-base sm:text-lg mt-2'>Difficulty</span>
              <span className='text-white text-sm sm:text-base'>{difficultyMap[difficulty] || difficulty}</span>
            </div>
            <div className='flex flex-col justify-center items-center'>
              <span
                className='bg-gray-50 rounded-full shadow-md text-green-600 hover:bg-gray-200 hover:text-green-800 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl icon--time-preparation'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-base sm:text-lg mt-2'>Prep. time</span>
              <span className='text-white text-sm sm:text-base'>{cooking_time}</span>
            </div>
            <div className='flex flex-col justify-center items-center'>
              <span
                className='bg-gray-50 rounded-full shadow-md text-green-600 hover:bg-gray-200 hover:text-green-800 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl icon--time-total'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-base sm:text-lg mt-2'>Total time</span>
              <span className='text-white text-sm sm:text-base'>{total_time}</span>
            </div>
            <div className='flex flex-col justify-center items-center'>
              <span
                className='bg-gray-50 rounded-full shadow-md text-green-600 hover:bg-gray-200 hover:text-green-800 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl icon--servings'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-base sm:text-lg mt-2'>Portions</span>
              <span className='text-white text-sm sm:text-base'>{porciones}</span>
            </div>
          </div>
        </div>
  
        {/* Secciones para dispositivos grandes (lg y superiores) */}
        <div className='hidden lg:flex lg:flex-row bg-black'>
          {/* Ingredientes Columna Izquierda */}
          <div className='w-1/2 p-4 text-white'>
            {renderIngredientsSection()}
            <hr className='separator--silver-60' />
            {renderNutritionSection()}
            {renderDevicesSection()}
            {renderUsefulItemsSection()}
          </div>
          
          {/* Instrucciones Columna Derecha */}
          <div className='w-1/2 p-4'>
            {renderStepsSection()}
            {renderTipsSection()}
            {renderCountrySection()}
            {renderCollectionsSection()}
            {renderTagsSection()}
          </div>
        </div>
        
        {/* Secciones para dispositivos pequeños (por debajo de lg) - Orden específico */}
        <div className='lg:hidden bg-black'>
          {/* Sección de ingredientes */}
          <div className='p-4 text-white'>
            {renderIngredientsSection()}
            <hr className='separator--silver-60' />
          </div>
          
          {/* Sección de preparación */}
          <div className='p-4'>
            {renderStepsSection()}
            <hr className='separator--silver-60' />
          </div>
          
          {/* Sección de tips */}
          <div className='p-4'>
            {renderTipsSection()}
          </div>
          
          {/* Accesorios útiles */}
          <div className='p-4 text-white'>
            {renderUsefulItemsSection()}
          </div>
          
          {/* Dispositivos y accesorios */}
          <div className='p-4 text-white'>
            {renderDevicesSection()}
          </div>
          
          {/* País */}
          <div className='p-4'>
            {renderCountrySection()}
          </div>
          
          {/* También incluido en */}
          <div className='p-4'>
            {renderCollectionsSection()}
          </div>
          
          {/* Etiquetas */}
          <div className='p-4'>
            {renderTagsSection()}
          </div>
          
          {/* Nutrición al final para móviles */}
          <div className='p-4 text-white'>
            {renderNutritionSection()}
          </div>
        </div>
      </div>
      
      {/* Recetas alternativas - siempre al final */}
      {renderRecommendedSection()}
    </main>
  )
}