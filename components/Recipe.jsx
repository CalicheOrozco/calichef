import React, { useContext, useState, useEffect } from 'react'
import { FaStar } from 'react-icons/fa'
import { CalichefContext } from '../context/MyContext'
import { FaShareFromSquare } from 'react-icons/fa6'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { MdShoppingCart, MdRemoveShoppingCart } from "react-icons/md";
import Card from './Card'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';

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

  const router = useRouter();

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

  return (
    <main className='bg-black text-white'>
      <div className='page-content flex flex-col'>
        
          <div>
            <div>
              <div className='recipe-card'>
                <div>
                <Image
                      sizes="(min-width: 320px) 100vw, (min-width: 768px) 50vw, (min-width: 1024px) 33vw"
                      src={img_url}
                      alt={title}
                      title={title}
                      width={600}
                      height={300}
                      priority
                      className="block rounded-sm"
                    />
                </div>

                <div className='recipe-card__info bg-black'>
                  {category && (
                    <div className='flex flex-wrap gap-2 mb-4'>
                      {category.map((cat, index) => (
                        <span key={index} className='bg-gray-700 text-white px-3 py-1 rounded-full text-sm'>
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  <div
                    id='tm-versions-modal'
                  >
                    {tm_versions?.map(version => (
                      <core-badge key={version}>
                        {version.toUpperCase()}
                      </core-badge>
                    ))}
                  </div>
                  
                    <h1 className='text-4xl my-10 font-bold text-white'>
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

                  <div className='flex flex-row justify-around items-center py-6 cursor-pointer'>
                    {isAuthenticated && (
                      <div className='flex flex-col justify-center items-center cursor-pointer'>
                        {isFavorite ? (
                          <FaHeart
                            onClick={() => updateFavorites(id)}
                            className='text-red-500 hover:text-red-700 text-4xl font-semibold cursor-pointer'
                          />
                        ) : (
                          <FaRegHeart
                            onClick={() => updateFavorites(id)}
                            className='text-white hover:text-gray-500 text-4xl font-semibold cursor-pointer'
                          />
                        )}
                        <span className='text-white'>Favorito</span>
                      </div>
                    )}
                    <div className='flex flex-col justify-center items-center'>
                      <FaShareFromSquare
                        onClick={handleShareRecipe}
                        className='text-white hover:text-gray-500 text-4xl font-semibold cursor-pointer'
                      />
                      <span className='text-white'>Compartir</span>
                    </div>
                    <div className='flex flex-col justify-center items-center'>
                    {
                      isInShoppingList ? (
                        <MdRemoveShoppingCart
                          onClick={handleShoppingList}
                          className='text-red-500 hover:text-red-700 text-4xl font-semibold cursor-pointer'
                        />
                      ) : (
                        <MdShoppingCart
                          onClick={handleShoppingList}
                          className='text-white hover:text-gray-500 text-4xl font-semibold cursor-pointer'
                        />
                      )
                    }
                      <span className='text-white'>Add Shopping</span>
                    </div>

                  </div>
                </div>
                <hr className='separator--silver-60' />
              </div>
            </div>
          </div>
        <div className='py-5'>
          
          <div className='flex gap-y-8 gap-x-32 text-center flex-wrap justify-center lg:justify-around items-center my-8'>
            <div id='rc-icon-difficulty' className='flex flex-col justify-center items-center '>
              <span
                id='rc-icon-difficulty-icon'
                className='core-feature-icons__icon icon icon--chef-hat'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-lg'>Difficulty</span>
              <span className='text-white'>{difficultyMap[difficulty] || difficulty}</span>
            </div>
            <div id='rc-icon-active-time' className='flex flex-col justify-center items-center gap-y-1'>
              <span
                id='rc-icon-active-time-icon'
                className='core-feature-icons__icon icon icon--time-preparation'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-lg'>
              Prep. time
                </span>
                <span className='text-white'>{cooking_time}</span>
            </div>
            <div className='flex flex-col justify-center items-center gap-y-1'>
              <span
                id='rc-icon-total-time-icon'
                className='core-feature-icons__icon icon icon--time-total'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-lg'>
                Total time
                </span>
                <span className=''>
                {total_time}
                </span>
            </div>
            <div className='flex flex-col justify-center items-center gap-y-1'>
              <span
                id='rc-icon-total-time-icon'
                className='core-feature-icons__icon icon icon--servings'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <span className='font-bold text-lg'>Portions</span>{' '}
              <span>{porciones}</span>{' '}
                

            </div>
          </div>
        </div>
        <div className='flex flex-col md:flex-row bg-black'>
          <div className='w-full md:w-1/2 p-4 text-white'>
            <div className='pb-5'>
              <h3 className='text-white text-2xl pb-5'>
                Ingredientes
              </h3>
              <core-list-section>
                <ul id='ingredients-0' className='space-y-4'>
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
                              className='flex items-center justify-between py-2 px-4 rounded-lg hover:bg-neutral-800  cursor-pointer'
                              onClick={toggleIngredient}
                            >
                              <div className='flex items-center gap-3'>
                                {ingredient.image && 
                                  <div className='w-14 h-14 flex items-center justify-center'>
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
                                  <span className={`text-white ${isChecked ? 'line-through text-gray-500' : ''}`}>
                                    {processedName}
                                  </span>
                                  {ingredient.description && 
                                    <span className={`text-gray-400 text-sm block ${isChecked ? 'line-through opacity-50' : ''}`}>
                                      {ingredient.description}
                                    </span>
                                  }
                                </div>
                              </div>
                              {ingredient.amount && 
                                <span className={`text-gray-300 text-sm ${isChecked ? 'line-through opacity-50' : ''}`}>
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
            <hr className='separator--silver-60' />
            <div>
              <div className='nutritions pb-5'>
                <div className='bg-black bg-opacity-80 p-6 rounded-lg'>
                  <h3 className='text-2xl font-bold text-white mb-2'>Nutrition</h3>
                  <p className='text-gray-400 mb-4'>per 1 porción</p>
                  
                  <div className='space-y-4'>
                    {nutritions?.map((item, index) => (
                      <div key={index} className='flex justify-between items-center border-b border-gray-700 pb-2'>
                        <span className='text-lg capitalize'>{item.name}</span>
                        <span className='text-lg text-gray-300'>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <hr className='separator--silver-60' />
            {devices && (
                    <div>
                    <div className='nutritions pb-5'>
                      <div className='bg-black bg-opacity-80 p-6 rounded-lg'>
                        <h3 className='text-2xl text-white font-bold mb-2'>Dispositivos y accesorios</h3>
      
                        <div className='space-y-4'>
                          {devices?.map((item, index) => (
                            <div key={index} className='flex items-center'>
                              <Image
                                src={deviceImages[item] || 'https://assets.tmecosys.com/image/upload/t_web_ingredient_48x48_2x/icons/ingredient_icons/546'}
                                alt={item}
                                width={60}
                                height={60}
                              />
                              <span className='text-lg capitalize'>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  )}
            
            <hr className='separator--silver-60' />
            {useful_items && (
                    <div>
                    <div className='nutritions pb-5'>
                      <div className='bg-black bg-opacity-80 p-6 rounded-lg'>
                        <h3 className='text-2xl text-white font-bold mb-2'>Accesorios útiles</h3>
                        <div className='space-y-4'>
                          {useful_items?.map((item, index) => (
                            <div key={index} className='flex items-center'>
                              <span className='text-lg capitalize'>- {item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <hr className='separator--silver-60' />
                  </div>
                  )}
            
          </div>
          <div className='w-full md:w-1/2 p-4'>
            
            {steps && (
                    <div>
                    <core-list-section>
                      <h3 className='text-white text-2xl pb-8'>
                        Preparación
                      </h3>
                      <ol className='space-y-4'>
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
                              key={index} 
                              id={`preparation-step--0-${index}`}
                              className='py-2 px-4 rounded-lg hover:bg-neutral-800  cursor-pointer'
                              onClick={toggleStep}
                            >
                              <div className='preparation-step-number'>
                                <span className={`${isChecked ? 'line-through text-gray-500' : 'text-green-500'}`}>{index + 1}</span>
                              </div>
                              <span className={`${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>{step}</span>
                            </li>
                          );
                        })}
                      </ol>
                    </core-list-section>
                  </div>
                  )}
            {nutritions && (
                    <div id='nutritions-mobile' className='nutritions-wrapper'>
                    <div className='nutritions pb-5'>
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
                  )}
            
            {tips && (
              <>
                <div
                  className='py-8 text-white'
                >
                  <h3 id='hints-and-tricks-title' className='text-white text-2xl pb-8'>
                    Sugerencias y consejos
                  </h3>
                  <ul className='flex flex-row flex-wrap gap-2 mb-4'>
                    {tips?.map((tip, index) => (
                      <li key={index} id={`hint-and-trick-${index}`}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <hr className='separator--silver-60' />
              </>
            )}
            {country && (
              <>
                <div
                  id='hints-and-tricks'
                  className='py-8 text-white'
                >
                  <h3 id='hints-and-tricks-title' className='text-white text-2xl pb-8'>
                  País
                  </h3>
                  <ul className='flex list-none flex-row justify-start items-center flex-wrap gap-2'>
                    {country?.map((item, index) => (
                      <li key={index} className='flex flex-col items-center'>
                        <Image className='pb-2' src={countryMap[`${item}img`]} alt={item} width={30} height={30} />
                        <span>{countryMap[item]}</span>
                      </li>
                  ))}
                  </ul>
                </div>
                <hr className='separator--silver-60' />
              </>
            )}
            {collections && collections.length > 0 && (
              <>
                <div
                  className='py-8 text-white'
                >
                  <h3 className='text-white text-2xl font-bold pb-8'>
                    También incluido en
                  </h3>
                  <div className='flex flex-col space-y-4'>
                    {collections.map((collection, index) => (
                      <a 
                        key={index} 
                        href={`/collections/${collection.id}`}
                        className='block'
                      >
                        <div className='flex items-center bg-neutral-900 p-3 rounded-lg hover:bg-neutral-800'>
                          <div className='w-20 h-20 mr-4 flex-shrink-0'>
                            <Image 
                              src={collection.image_url} 
                              alt={collection.name} 
                              width={80} 
                              height={80} 
                              className='rounded-md object-cover'
                            />
                          </div>
                          <div className='flex flex-col'>
                            <h4 className='text-lg font-semibold text-white'>{collection.name}</h4>
                            <p className='text-gray-400 text-sm'>
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
            )}
            {tags && (
                    <div
                    className='py-8'
                  >
                    <h3 className='text-white text-2xl font-bold pb-8'>
                      Etiquetas
                    </h3>
                    <div className='py-6 flex flex-wrap gap-4'>
                          {tags?.map((tag, index) => (
                            <a
                              key={index}
                              id={`additional-category-${index}`}
                              className='py-3 px-4 bg-white text-green-600'
                              // href={`/${tag}`}
                            >
                              {`#${tag}`}
                            </a>
                          ))}
                        </div>
                  </div>
                  )}
            
            <hr className='separator--silver-60' />
          </div>
        </div>
      </div>
      {recommended && (
        <div className='recommended-recipes pl-5'>
          <h2 className='text-white text-3xl pb-4'>Recetas alternativas</h2>
          <div className='flex flex-wrap justify-center md:justify-between items-center gap-y-5'>
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
      )}
    </main>
  )
}

