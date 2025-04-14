import React, { useContext, useState, useEffect } from 'react'
import { FaStar, FaStarHalf } from 'react-icons/fa'
import { TbNotes, TbNotesOff } from 'react-icons/tb'
import { CalichefContext } from '../context/MyContext'
import { FaShareFromSquare } from 'react-icons/fa6'
import { openDB } from 'idb'
import Card from './Card'
import Image from 'next/image'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

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
  language,
  cooking_time,
}) {
  const [isSaved, setIsSaved] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState({})

  const difficultyMap = {
    'E': 'Fácil',
    'M': 'Medio',
    'A': 'Avanzado'
  }

  const deviceImages = {
    TM7: 'https://patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com/tm7-83b22c91a1a1e7fee3797168f05f9754.png',
    TM6: 'https://patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com/tm6-fff867f1cfc7f35118b8b6dfffca8339.png',
    TM5: 'https://patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com/tm5-a3a665744eb0093e9108135bf6b1baa4.png',
    TM31: 'https://patternlib-all.prod.external.eu-tm-prod.vorwerk-digital.com/tm31-d180149ce35a8c8d99d7a3bbff0f1bec.png',
    horno: 'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5406',
    oven: 'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5406',
    four: 'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5406',
    refrigerador:'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5460',
    refrigerator:'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5460',
    frigorífico:'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5460',
    estufa:'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5428',
    stove:'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5428',
    'stove top':'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/5428',
    barbacoa:'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/6163',
    'Cortador Thermomix':'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/341878',
    'cubre cuchillas':'https://assets.tmecosys.com/image/upload/t_web_rdp_device_56x56_2x/icons/utensil_icons/218594'
  };

  const countryMap = {
    'MX': 'México',
    'MXimg': 'https://cdn.gtranslate.net/flags/svg/countries/mx.svg',
    'US': 'United States',
    'USimg': 'https://cdn.gtranslate.net/flags/svg/countries/us.svg',
    'CA': 'Canada',
    'CAimg': 'https://cdn.gtranslate.net/flags/svg/countries/ca.svg',
    'AU': 'Australia',
    'AUimg': 'https://cdn.gtranslate.net/flags/svg/countries/au.svg',
    'UK': 'United Kingdom',
    'UKimg': 'https://cdn.gtranslate.net/flags/svg/countries/gb.svg',
    'AR': 'Argentina',
    'ARimg': 'https://cdn.gtranslate.net/flags/svg/countries/ar.svg',
    'CO': 'Colombia',
    'COimg': 'https://cdn.gtranslate.net/flags/svg/countries/co.svg',
    'AT': 'Austria',
    'ATimg': 'https://cdn.gtranslate.net/flags/svg/countries/at.svg',
    "CH": "Chile",
    "CHimg": 'https://cdn.gtranslate.net/flags/svg/countries/cl.svg',
    "EAU": "United Arab Emirates",
    "EAUimg": 'https://cdn.gtranslate.net/flags/svg/countries/ae.svg',
    "ES": "España",
    "ESimg": 'https://cdn.gtranslate.net/flags/svg/countries/es.svg',
    "GT": "Guatemala",
    "GTimg":'https://cdn.gtranslate.net/flags/svg/countries/gt.svg',
    "ID": "Indonesia",
    "IDimg":'https://cdn.gtranslate.net/flags/svg/countries/id.svg',
    "IS": "Islandia",
    "ISimg":'https://cdn.gtranslate.net/flags/svg/countries/is.svg',
    "KSA": "Kingdom of Saudi Arabia",
    "KSAimg":'https://cdn.gtranslate.net/flags/svg/countries/sa.svg',
    "MY": "Malaysia",
    "MYimg":'https://cdn.gtranslate.net/flags/svg/countries/my.svg',
    "NO": "Norway",
    "NOimg":'https://cdn.gtranslate.net/flags/svg/countries/no.svg',
    "PA": "Panamá",
    "PAimg":'https://cdn.gtranslate.net/flags/svg/countries/pa.svg',
    "PH": "Philippines",
    "PHimg":'https://cdn.gtranslate.net/flags/svg/countries/ph.svg',
    "PE": "Perú",
    "PEimg":'https://cdn.gtranslate.net/flags/svg/countries/pe.svg',
    "PY": "Paraguay",
    "PYimg":'https://cdn.gtranslate.net/flags/svg/countries/py.svg',
    "SG": "Singapore",
    "SGimg":'https://cdn.gtranslate.net/flags/svg/countries/sg.svg',
    "SE": "Sweden",
    "SEimg":'https://cdn.gtranslate.net/flags/svg/countries/se.svg',
    "CHE": "Switzerland",
    "CHEimg":'https://cdn.gtranslate.net/flags/svg/countries/ch.svg',
    "FR": "France",
    "FRimg":'https://cdn.gtranslate.net/flags/svg/countries/fr.svg',
    "BE": "Belgium",
    "BEimg":'https://cdn.gtranslate.net/flags/svg/countries/be.svg',
  };

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

  const { userRecipes, setUserRecipes } = contextValue

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

  return (
    <main className='bg-black text-white'>
      <div className='page-content flex flex-col'>
        <div className='l-header-offset-small'>
          <div className='g-wrapper'>
            <div className='l-tile'>
              <div id='recipe-card' className='recipe-card'>
                <div className='recipe-card__picture'>
                  <core-image-loader
                    id='recipe-card__image-loader'
                    loaded='true'
                  >
                    <Image
                      sizes='(min-width: 1333px) 600px, (min-width: 992px) 667px, (min-width: 768px) 496px, (min-width: 576px) 767px, (min-width: 0px) 575px'
                      src={img_url}
                      alt={title}
                      title={title}
                      width={600}
                      height={400}
                      priority
                    />

                  </core-image-loader>
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
                    className='recipe-card__tm-version'
                    id='tm-versions-modal'
                  >
                    {tm_versions?.map(version => (
                      <core-badge key={version}>
                        {version.toUpperCase()}
                      </core-badge>
                    ))}
                  </div>
                  <core-ellipsis
                    lines-count='4'
                    className='recipe-card__title_ellipsis'
                  >
                    <h1 className='recipe-card__title overflow-hidden text-ellipsis line-clamp-4 text-white'>
                      {title}
                    </h1>
                  </core-ellipsis>

                  <div className='recipe-card__community'>
                    <core-rating>
                      <core-fetch-modal error-message='Esta función no está disponible actualmente.'>
                        <button className='core-rating__rating-list'>
                          {stars.map((star, index) => (
                            <span key={index}>
                              {star === 1 || star === 2 ? (
                                <FaStar className='text-yellow-500' />
                              ) : (
                                <FaStar className='text-gray-300' />
                              )}
                            </span>
                          ))}
                        </button>
                      </core-fetch-modal>
                      <span className='ml-2 text-white'>{rating_score}</span>
                      {/* Remove or modify the rating count display */}
                    </core-rating>
                  </div>

                  <div className='flex flex-row justify-around items-center py-6'>
                    {isSaved ? (
                      // TbNotesOff
                      <div className='flex flex-col justify-center items-center '>
                        <TbNotesOff
                          onClick={handleDeleteRecipe}
                          className='text-red-500 hover:text-red-700 text-4xl font-semibold'
                        />
                        <span className='text-white'>Eliminar</span>
                      </div>
                    ) : (
                      // TbNotes
                      <div className='flex flex-col justify-center items-center '>
                        <TbNotes
                          onClick={handleSaveRecipe}
                          className='text-white hover:text-gray-500 text-4xl font-semibold'
                        />
                        <span className='text-white'>Guardar</span>
                      </div>
                    )}
                    <div className='flex flex-col justify-center items-center'>
                      <FaShareFromSquare
                        onClick={handleShareRecipe}
                        className='text-white hover:text-gray-500 text-4xl font-semibold'
                      />
                      <span className='text-white'>Compartir</span>
                    </div>
                  </div>
                </div>
                <hr className='separator--silver-60' />
              </div>
            </div>
          </div>
        </div>
        <div className='py-5'>
          
          <div className='flex gap-y-4 flex-wrap justify-around items-center mt-6'>
            <div id='rc-icon-difficulty' className='core-feature-icons__item'>
              <span
                id='rc-icon-difficulty-icon'
                className='core-feature-icons__icon icon icon--chef-hat'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <label
                id='rc-icon-difficulty-text'
                className='core-feature-icons__text text-center'
              >
                <span className='core-feature-icons__subtitle'>Dificultad</span>
                <span className='text-white'>{difficultyMap[difficulty] || difficulty}</span>
              </label>
            </div>
            <div id='rc-icon-active-time' className='core-feature-icons__item'>
              <span
                id='rc-icon-active-time-icon'
                className='core-feature-icons__icon icon icon--time-preparation'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <label
                id='rc-icon-active-time-text'
                className='core-feature-icons__text text-center group'
              >
                <span className='core-feature-icons__subtitle transition-colors duration-200'>
                  Tiempo de preparación
                </span>
                <span className='text-white'>{cooking_time}</span>
              </label>
            </div>
            <div id='rc-icon-total-time' className='core-feature-icons__item'>
              <span
                id='rc-icon-total-time-icon'
                className='core-feature-icons__icon icon icon--time-total'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <label
                id='rc-icon-total-time-text'
                className='core-feature-icons__text text-center'
              >
                <span className='core-feature-icons__subtitle'>
                  Tiempo total
                </span>
                {total_time}
              </label>
            </div>
            <div id='rc-icon-total-time' className='core-feature-icons__item'>
              <span
                id='rc-icon-total-time-icon'
                className='core-feature-icons__icon icon icon--servings'
                aria-expanded='false'
                aria-haspopup='true'
                role='button'
                tabIndex='0'
              ></span>
              <label
                id='rc-icon-total-time-text'
                className='core-feature-icons__text text-center'
              >
                <span className='core-feature-icons__subtitle'>Porciones</span>{' '}
                {porciones}
              </label>
            </div>
          </div>
        </div>
        <div className='flex flex-col md:flex-row bg-black'>
          <div className='w-full md:w-1/2 p-4 text-white'>
            <div id='ingredients' className='pb-5'>
              <h3 id='ingredients-title' className='text-white pb-5'>
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
                              className='flex items-center justify-between py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors duration-200 cursor-pointer'
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
            <div id='nutritions-desktop' className='nutritions-wrapper'>
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
              <hr className='separator--silver-60' />
            </div>
            
            <hr className='separator--silver-60' />
            {devices && (
                    <div id='nutritions-desktop' className='nutritions-wrapper'>
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
                    <hr className='separator--silver-60' />
                  </div>
                  )}
            
            <hr className='separator--silver-60' />
            {useful_items && (
                    <div id='nutritions-desktop' className='nutritions-wrapper'>
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
                    <div id='preparation-steps' className='preparation-steps'>
                    <core-list-section>
                      <h3 id='preparation-steps-title' className='text-white'>
                        Preparación
                      </h3>
                      <ol>
                        {steps?.map((step, index) => (
                          <li key={index} id={`preparation-step--0-${index}`}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </core-list-section>
                  </div>
                  )}
            <hr className='separator--silver-60' />
            {nutritions && (
                    <div id='nutritions-mobile' className='nutritions-wrapper'>
                    <div className='nutritions pb-5'>
                      <dl>
                        <h3 id='ingredients-title' className='text-white pb-5'>
                          Inf. nutricional
                        </h3>
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
                  id='hints-and-tricks'
                  className='hints-and-tricks recipe-section text-white'
                >
                  <h3 id='hints-and-tricks-title' className='text-white'>
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
                  className='hints-and-tricks recipe-section text-white'
                >
                  <h3 id='hints-and-tricks-title' className='text-white'>
                  País
                  </h3>
                  <ul className='flex list-none flex-row justify-center items-center flex-wrap gap-2'>
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
                  id='collections-section'
                  className='collections-section recipe-section text-white'
                >
                  <h3 id='collections-title' className='text-white text-2xl font-bold mb-4'>
                    También incluido en
                  </h3>
                  <div className='flex flex-col space-y-4'>
                    {collections.map((collection, index) => (
                      <a 
                        key={index} 
                        href={`/collection/${collection.name.replace(/\s+/g, '-').toLowerCase()}`}
                        className='block'
                      >
                        <div className='flex items-center bg-neutral-900 p-3 rounded-lg hover:bg-neutral-800 transition-colors duration-200'>
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
                    id='additional-categories'
                    className='additional-categories recipe-section'
                  >
                    <h3 id='additional-categories-title' className='text-white'>
                      Etiquetas
                    </h3>
                    <core-tags-wrapper
                      className='core-tags-wrapper--alternative'
                      aria-expanded='false'
                    >
                      <div className='core-tags-wrapper__wrapper transition duration-200 max-h-56'>
                        <div className='core-tags-wrapper__tags-container'>
                          {tags?.map((tag, index) => (
                            <a
                              key={index}
                              id={`additional-category-${index}`}
                              className='core-badge--high'
                              // href={`/${tag}`}
                            >
                              {`#${tag}`}
                            </a>
                          ))}
                        </div>
                      </div>
                    </core-tags-wrapper>
                  </div>
                  )}
            
            <hr className='separator--silver-60' />
          </div>
        </div>
      </div>
      {recommended && (
        <div className='recommended-recipes'>
          <h2 className='text-white pb-4'>Recetas alternativas</h2>
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
