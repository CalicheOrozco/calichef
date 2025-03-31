/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalichefContext } from '../context/MyContext'
import { FaSearch } from 'react-icons/fa'
import { IoRestaurant, IoClose, IoHomeSharp } from 'react-icons/io5'
import Link from 'next/link'
import Image from 'next/image'

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
    return null
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
    setIsModalOpen,
    categoryFilter,
    setCategoryFilter
  } = contextValue

  const getCategories = () => {
    if (!originalData) return [];
    
    let filteredData = [...originalData];

    // Aplicar filtros actuales excepto categorías
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (countryFilter !== 'All') {
      filteredData = filteredData.filter(item => item.country && item.country.includes(countryFilter));
    }
    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(item => item.difficulty && item.difficulty === difficultyFilter);
    }
    if (languageFilter !== 'All') {
      filteredData = filteredData.filter(item => item.language && item.language === languageFilter);
    }
    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(item => 
        item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      );
    }
    
    const categoryCount = {};
    filteredData.forEach(item => {
      if (item.category) {
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        categories.forEach(category => {
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
      }
    });

    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  const categories = getCategories();

  const handleFilter = searchTermValue => {
    if (!originalData || !Array.isArray(originalData)) {
      setAllData([])
      return
    }

    let filteredData = [...originalData]

    const applyFilter = (condition, filterFn) => {
      if (condition && Array.isArray(filteredData)) {
        filteredData = filteredData.filter(filterFn)
        filteredData = searchTermValue === ''
          ? filteredData.sort(() => Math.random() - 0.5)
          : filteredData.sort((a, b) => b.rating_count - a.rating_count)
      }
    }

    applyFilter(
      searchTermValue,
      item => item.title.toLowerCase().includes(searchTermValue.toLowerCase())
    )

    applyFilter(
      countryFilter !== 'All',
      item => item.country && item.country.includes(countryFilter)
    )

    applyFilter(
      difficultyFilter !== 'All',
      item => item.difficulty && item.difficulty.toLowerCase() === difficultyFilter.toLowerCase()
    )

    applyFilter(
      languageFilter !== 'All',
      item => item.language && item.language.toLowerCase() === languageFilter.toLowerCase()
    )

    applyFilter(
      starsFilter !== 'All',
      item => item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
    )

    applyFilter(
      categoryFilter.length > 0,
      item => {
        if (!item.category) return false;
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        return categoryFilter.some(cat => categories.includes(cat));
      }
    )

    setAllData(filteredData)
  }

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



  const debouncedHandleFilter = useCallback(debounce(handleFilter, 600), [
    originalData,
    countryFilter,
    difficultyFilter,
    languageFilter,
    starsFilter,
    categoryFilter
  ])

  useEffect(() => {
    setIsHomePage(pathname === '/')
  }, [pathname])

  useEffect(() => {
    handleFilter(searchTerm)
  }, [countryFilter, difficultyFilter, languageFilter, starsFilter, categoryFilter])

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
    setCategoryFilter([])
    setAllData(originalData)
  }

  const areFiltersActive = () => {
    return (
      searchTerm !== '' ||
      countryFilter !== 'All' ||
      difficultyFilter !== 'All' ||
      languageFilter !== 'All' ||
      starsFilter !== 'All' ||
      categoryFilter !== 'All'
    )
  }

  // Add these new functions after the areFiltersActive function
  const difficultyMap = {
    'E': 'Fácil',
    'M': 'Medio',
    'A': 'Avanzado'
  };

  const languageMap = {
    'ES': 'Español',
    'EN': 'English'
  };

  const countryMap = {
    'MX': 'México',
    'US': 'United States',
    'CA': 'Canada',
    'AU': 'Australia',
    'UK': 'United Kingdom',
    'AR': 'Argentina',
    'CO': 'Colombia',
    'AT': 'Austria',
    "CH": "Chile",
    "EAU": "United Arab Emirates",
    "ES": "España",
    "GT": "Guatemala",
    "ID": "Indonesia",
    "IS": "Islandia",
    "KSA": "Kingdom of Saudi Arabia",
    "MY": "Malaysia",
    "NO": "Norway",
    "PA": "Panamá",
    "PH": "Philippines",
    "PE": "Perú",
    "PY": "Paraguay",
    "SG": "Singapore",
    "SE": "Sweden",
  };

  const getAvailableOptions = (field) => {
    if (!originalData) return [];

    let filteredData = [...originalData];

    // Apply current filters except for the field we're getting options for
    if (searchTerm && field !== 'search') {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (countryFilter !== 'All' && field !== 'country') {
      filteredData = filteredData.filter(
        item => item.country && item.country.includes(countryFilter)
      );
    }
    if (difficultyFilter !== 'All' && field !== 'difficulty') {
      filteredData = filteredData.filter(
        item => item.difficulty && item.difficulty === difficultyFilter
      );
    }
    if (languageFilter !== 'All' && field !== 'language') {
      filteredData = filteredData.filter(
        item => item.language && item.language === languageFilter
      );
    }
    if (starsFilter !== 'All' && field !== 'rating') {
      filteredData = filteredData.filter(
        item => item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      );
    }

    // Get unique values for the specified field
    const uniqueValues = new Set();
    filteredData.forEach(item => {
      if (field === 'country' && item.country) {
        item.country.forEach(country => uniqueValues.add(country));
      } else if (field === 'difficulty' && item.difficulty) {
        uniqueValues.add(item.difficulty);
      } else if (field === 'language' && item.language) {
        uniqueValues.add(item.language);
      } else if (field === 'rating' && item.rating_score) {
        uniqueValues.add(Math.floor(parseFloat(item.rating_score)).toString());
      }
    });

    const values = Array.from(uniqueValues);
    
    // Map the values to their full names
    if (field === 'country') {
      return values.map(code => ({ code, name: countryMap[code] || code })).sort((a, b) => a.name.localeCompare(b.name));
    } else if (field === 'difficulty') {
      return values.map(code => ({ code, name: difficultyMap[code] || code })).sort((a, b) => a.name.localeCompare(b.name));
    } else if (field === 'language') {
      return values.map(code => ({ code, name: languageMap[code] || code })).sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return values.sort();
  };

  return (
    <>
      <header tabIndex='-1' className='page-header'>
        <div className='w-full flex flex-row h-16 md:h-20 bg-neutral-800 border-b border-neutral-700 px-2 md:px-4 justify-between items-center'>
          <Link href='/' className='w-48 md:w-96' passHref>
            <Image 
              className='object-contain w-auto h-auto'
              src='/calichefLogo.png'
              alt='Calichef Logo'
              width={200}
              height={40}
              priority
            />
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
            <div className='bg-neutral-800 border border-neutral-700 w-full md:w-2/3 p-4 md:p-8 rounded-2xl shadow-xl max-w-2xl'>
              <div className='flex justify-between items-center mb-4 md:mb-6'>
                <h2 className='text-xl md:text-2xl font-semibold text-white'>Filtrar Recetas</h2>
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
                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    aria-label='Buscar'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-300'>País</label>
                    <select
                      value={countryFilter}
                      onChange={e => setCountryFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todos los países</option>
                      {getAvailableOptions('country').map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-300'>Dificultad</label>
                    <select
                      value={difficultyFilter}
                      onChange={e => setDifficultyFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todas las dificultades</option>
                      {getAvailableOptions('difficulty').map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-300'>Idioma</label>
                    <select
                      value={languageFilter}
                      onChange={e => setLanguageFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                    >
                      <option value='All'>Todos los idiomas</option>
                      {getAvailableOptions('language').map(({ code, name }) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='space-y-1 md:space-y-2'>
                    <label className='block text-xs md:text-sm font-medium text-gray-300'>Calificación</label>
                    <select
                      value={starsFilter}
                      onChange={e => setStarsFilter(e.target.value)}
                      className='w-full p-2 md:p-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
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

                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold text-white'>Categoría</h3>
                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {categories.map((category) => (
                      <div 
                        key={category.name}
                        className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                        onClick={() => {
                          const newFilter = categoryFilter.includes(category.name)
                            ? categoryFilter.filter(cat => cat !== category.name)
                            : [...categoryFilter, category.name]
                          setCategoryFilter(newFilter)
                        }}
                      >
                        <div className='flex items-center'>
                          <input
                            type="checkbox"
                            checked={categoryFilter.includes(category.name)}
                            onChange={() => {
                              const newFilter = categoryFilter.includes(category.name)
                                ? categoryFilter.filter(cat => cat !== category.name)
                                : [...categoryFilter, category.name]
                              setCategoryFilter(newFilter)
                            }}
                            className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                          />
                          <span className='ml-3 text-white'>{category.name}</span>
                        </div>
                        <span className='text-gray-400'>{category.count} resultados</span>
                      </div>
                    ))}
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