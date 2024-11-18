import React, { useContext, useState, useEffect } from 'react'
import { FaStar, FaStarHalf } from 'react-icons/fa'
import { CalichefContext } from '../context/MyContext'
import { openDB } from 'idb'
import Card from './Card'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

export default function Recipe ({
  id,
  title,
  img_url,
  tm_versions,
  rating_score,
  rating_count,
  difficulty,
  cooking_time,
  total_time,
  porciones,
  ingredients,
  nutritions,
  steps,
  tags,
  tips,
  recommended
}) {
  const [isSaved, setIsSaved] = useState(false)

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
                    <img
                      sizes='(min-width: 1333px) 600px, (min-width: 992px) 667px, (min-width: 768px) 496px, (min-width: 576px) 767px, (min-width: 0px) 575px'
                      src={img_url}
                      alt={title}
                      title={title}
                    />
                  </core-image-loader>
                </div>

                <div className='recipe-card__info bg-black'>
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
                              {star === 1 ? (
                                <FaStar className='text-yellow-500' />
                              ) : star === 2 ? (
                                <FaStarHalf className='text-yellow-500' />
                              ) : (
                                <FaStar className='text-gray-300' />
                              )}
                            </span>
                          ))}
                        </button>
                      </core-fetch-modal>
                      <span className='ml-2 text-white'>{rating_score}</span>
                      <span className='core-rating__label'>
                        ({rating_count})
                      </span>
                    </core-rating>
                  </div>

                  <div className='flex justify-center items-center py-6'>
                    {isSaved ? (
                      <button
                        onClick={handleDeleteRecipe}
                        className='bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded'
                      >
                        Eliminar receta
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveRecipe}
                        className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded'
                      >
                        Guardar receta
                      </button>
                    )
                    }
                    <button
                    onClick={handleShareRecipe}
                    className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded ml-4'
                  >
                    Compartir
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='icons py-5'>
          <div className='flex gap-y-4 flex-wrap justify-around items-center'>
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
                {difficulty}
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
                className='core-feature-icons__text text-center'
              >
                <span className='core-feature-icons__subtitle'>
                  Tiempo de preparación
                </span>
                {cooking_time}
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
                className='core-feature-icons__text'
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
                <ul id='ingredients-0'>
                  {ingredients?.map((ingredient, index) => (
                    <li key={index} className='core-list-section__item py-1'>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </core-list-section>
            </div>
            <hr className='separator--silver-60' />
            <div id='nutritions-desktop' className='nutritions-wrapper'>
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
          </div>
          <div className='w-full md:w-1/2 p-4'>
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
            <hr className='separator--silver-60' />
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
            {tips && (
              <>
                <div
                  id='hints-and-tricks'
                  className='hints-and-tricks recipe-section text-white'
                >
                  <h3 id='hints-and-tricks-title' className='text-white'>
                    Sugerencias y consejos
                  </h3>
                  <ul>
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
            <hr className='separator--silver-60' />
          </div>
        </div>
      </div>
      {recommended && (
        <div className='recommended-recipes'>
          <h2 className='text-white pb-4'>Recetas alternativas</h2>
          <div className='flex flex-wrap justify-center md:justify-between items-center gap-y-5'>
            {recommended.map((item, index) => (
              <Card
                key={item.id}
                id={item.id}
                title={item.title}
                rating_score={item.rating_score}
                rating_count={item.rating_count}
                time={item.total_time}
                img_url={item.img_url}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
