import React, { useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalichefContext } from '../context/MyContext'
import { FaSearch } from 'react-icons/fa'
import { IoRestaurant, IoClose, IoHomeSharp } from 'react-icons/io5'
import Link from 'next/link'

const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function Navbar () {
  const [isHomePage, setIsHomePage] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const contextValue = useContext(CalichefContext)
  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Navbar')
  }
  const {
    setAllData,
    userRecipes,
    originalData,
    searchTerm,
    setSearchTerm,
    countryFilter,
    setCountryFilter,
    difficultyFilter,
    setDifficultyFilter,
    languageFilter,
    setLanguageFilter,
    starsFilter,
    setStarsFilter,
    isModalOpen,
    setIsModalOpen
  } = contextValue

  useEffect(() => {
    const savedSearchTerm = localStorage.getItem('searchTerm')
    if (savedSearchTerm && originalData) {
      const filteredData = originalData.filter(item =>
        item.title.toLowerCase().includes(savedSearchTerm.toLowerCase())
      )
      setSearchTerm(savedSearchTerm)
      setAllData(filteredData)
      localStorage.removeItem('searchTerm')
    }
  }, [originalData])

  const handleSearch = event => {
    setSearchTerm(event.target.value)
    debouncedHandleFilter(event.target.value)
  }

  const handleFilter = searchTermValue => {
    let filteredData = originalData
    if (searchTermValue) {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTermValue.toLowerCase())
      )
      searchTermValue === ''
        ? filteredData?.sort(() => Math.random() - 0.5)
        : filteredData?.sort((a, b) => b.rating_count - a.rating_count)
    }
    if (countryFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.Country &&
          item.Country.toLowerCase() === countryFilter.toLowerCase()
      )
      searchTermValue === ''
        ? filteredData?.sort(() => Math.random() - 0.5)
        : filteredData?.sort((a, b) => b.rating_count - a.rating_count)
    }
    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.Dificultad &&
          item.Dificultad.toLowerCase() === difficultyFilter.toLowerCase()
      )
      searchTermValue === ''
        ? filteredData?.sort(() => Math.random() - 0.5)
        : filteredData?.sort((a, b) => b.rating_count - a.rating_count)
    }
    if (languageFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.language &&
          item.language.toLowerCase() === languageFilter.toLowerCase()
      )
      searchTermValue === ''
        ? filteredData?.sort(() => Math.random() - 0.5)
        : filteredData?.sort((a, b) => b.rating_count - a.rating_count)
    }
    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.rating_score &&
          Math.floor(item.rating_score) === parseInt(starsFilter)
      )
      searchTermValue === ''
        ? filteredData?.sort(() => Math.random() - 0.5)
        : filteredData?.sort((a, b) => b.rating_count - a.rating_count)
    }

    setAllData(filteredData)
  }

  const debouncedHandleFilter = useCallback(debounce(handleFilter, 600), [
    originalData,
    countryFilter,
    difficultyFilter,
    languageFilter,
    starsFilter
  ])

  useEffect(() => {
    setIsHomePage(pathname === '/')
  }, [pathname])

  useEffect(() => {
    handleFilter(searchTerm)
  }, [countryFilter, difficultyFilter, languageFilter, starsFilter])

  const openModal = () => {
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
  }
  const handleModalSearch = () => {
    handleFilter(searchTerm)
    closeModal()
    if (!isHomePage) {
      router.push('/')
    }
  }

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      handleModalSearch()
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCountryFilter('All')
    setDifficultyFilter('All')
    setLanguageFilter('All')
    setStarsFilter('All')
    setAllData(originalData)
  }

  const areFiltersActive = () => {
    return (
      searchTerm !== '' ||
      countryFilter !== 'All' ||
      difficultyFilter !== 'All' ||
      languageFilter !== 'All' ||
      starsFilter !== 'All'
    )
  }

  // Add these new functions after the areFiltersActive function
  const getAvailableOptions = (field) => {
    if (!originalData) return []

    let filteredData = [...originalData]

    // Apply current filters except for the field we're getting options for
    if (searchTerm && field !== 'search') {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (countryFilter !== 'All' && field !== 'Country') {
      filteredData = filteredData.filter(
        item => item.Country && item.Country.toLowerCase() === countryFilter.toLowerCase()
      )
    }
    if (difficultyFilter !== 'All' && field !== 'Dificultad') {
      filteredData = filteredData.filter(
        item => item.Dificultad && item.Dificultad.toLowerCase() === difficultyFilter.toLowerCase()
      )
    }
    if (languageFilter !== 'All' && field !== 'language') {
      filteredData = filteredData.filter(
        item => item.language && item.language.toLowerCase() === languageFilter.toLowerCase()
      )
    }
    if (starsFilter !== 'All' && field !== 'rating') {
      filteredData = filteredData.filter(
        item => item.rating_score && Math.floor(item.rating_score) === parseInt(starsFilter)
      )
    }

    // Get unique values for the specified field
    const uniqueValues = new Set(
      filteredData
        .map(item => {
          if (field === 'rating') {
            return Math.floor(item.rating_score)
          }
          return item[field]
        })
        .filter(Boolean)
    )

    return Array.from(uniqueValues)
  }

  // Update the render section where the select elements are
  return (
    <>
      <header tabIndex='-1' className='page-header'>
        <div className='w-full flex flex-row h-16 md:h-20 bg-white px-2 md:px-4 justify-between items-center'>
          <Link href='/' className='w-48 md:w-96' passHref>
            <img className='object-contain' src='/calichefLogo.png' alt='Calichef Logo' />
          </Link>

          <div className='flex text-green-600 flex-row items-center gap-2 md:gap-4'>
            {userRecipes && userRecipes.length > 0 ? (
              <Link href='/recipes' passHref>
                <div className='flex justify-center items-center hover:text-green-300'>
                  <span className='text-base md:text-xl'>({userRecipes.length})</span>
                  <IoRestaurant className='mx-1 md:mx-2 cursor-pointer text-2xl md:text-3xl' />
                </div>
              </Link>
            ) : null}
            <div>
              <Link href='/' passHref>
                <div className='flex items-center cursor-pointer'>
                  <IoHomeSharp className='text-green-600 hover:text-green-300 text-2xl md:text-3xl' />
                </div>
              </Link>
            </div>
            <FaSearch
              className='cursor-pointer hover:text-green-300 text-xl md:text-2xl'
              onClick={openModal}
            />
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 overflow-y-auto md:overflow-hidden'>
          <div className='relative min-h-screen md:min-h-fit w-full flex items-center justify-center p-4'>
            <div className='bg-white w-full md:w-2/3 p-4 md:p-8 rounded-2xl shadow-xl max-w-2xl'>
              <div className='flex justify-between items-center mb-4 md:mb-6'>
                <h2 className='text-xl md:text-2xl font-semibold text-gray-800'>Filtrar Recetas</h2>
                <IoClose
                  className='text-2xl md:text-3xl text-gray-500 hover:text-red-600 transition-colors duration-200 cursor-pointer'
                  onClick={closeModal}
                />
              </div>

              <div className='space-y-4 md:space-y-6'>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='Buscar recetas...'
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyPress={handleKeyPress}
                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    aria-label='Buscar'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-700'>País</label>
                    <select
                      value={countryFilter}
                      onChange={e => setCountryFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todos los países</option>
                      {getAvailableOptions('Country').map(country => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-700'>Dificultad</label>
                    <select
                      value={difficultyFilter}
                      onChange={e => setDifficultyFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todas las dificultades</option>
                      {getAvailableOptions('Dificultad').map(difficulty => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty === 'fácil' ? 'Fácil' : difficulty === 'medio' ? 'Media' : 'Difícil'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-700'>Idioma</label>
                    <select
                      value={languageFilter}
                      onChange={e => setLanguageFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todos los idiomas</option>
                      {getAvailableOptions('language').map(language => (
                        <option key={language} value={language}>
                          {language === 'Spanish' ? 'Español' : 'Inglés'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-700'>Calificación</label>
                    <select
                      value={starsFilter}
                      onChange={e => setStarsFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todas las estrellas</option>
                      {getAvailableOptions('rating').sort().map(rating => (
                        <option key={rating} value={rating}>
                          {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='flex justify-end gap-x-2 md:gap-x-4 pt-4 md:pt-6'>
                  {areFiltersActive() && (
                    <button
                      onClick={clearFilters}
                      className='px-4 md:px-6 py-2 md:py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors duration-200 text-sm md:text-base'
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    onClick={handleModalSearch}
                    className='px-4 md:px-6 py-2 md:py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors duration-200 text-sm md:text-base'
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
