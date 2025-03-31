/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalichefContext } from '../context/MyContext'
import { FaSearch } from 'react-icons/fa'
import { IoRestaurant, IoClose, IoHomeSharp } from 'react-icons/io5'
import Link from 'next/link'

const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      func.apply(this, args)
    }, wait)
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
    setCategoryFilter,
    ingredientFilter,
    setIngredientFilter
  } = contextValue

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [cookingTimeFilter, setCookingTimeFilter] = useState('All')
  const [finalTimeFilter, setFinalTimeFilter] = useState('All')

  const getIngredients = () => {
    if (!originalData) return [];
    
    // Crear clave de caché que incluya todos los filtros activos
    const cacheKey = JSON.stringify({
      searchTerm,
      countryFilter,
      difficultyFilter,
      languageFilter,
      starsFilter,
      ingredientFilter
    });
    
    if (window._ingredientsCache?.[cacheKey]) {
      return window._ingredientsCache[cacheKey];
    }
    
    // Aplicar todos los filtros excepto el de ingredientes
    let filteredData = originalData.filter(item => {
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (countryFilter !== 'All' && !item.country?.includes(countryFilter)) return false;
      if (difficultyFilter !== 'All' && item.difficulty !== difficultyFilter) return false;
      if (languageFilter !== 'All' && item.language !== languageFilter) return false;
      if (starsFilter !== 'All' && (!item.rating_score || Math.floor(parseFloat(item.rating_score)) !== parseInt(starsFilter))) return false;
      return true;
    });

    // Si hay ingredientes seleccionados, filtrar las recetas que los contengan
    if (ingredientFilter.length > 0) {
      filteredData = filteredData.filter(item => {
        if (!item.ingredients) return false;
        const ingredientSet = new Set();
        
        const processIngredients = (ingredients) => {
          if (Array.isArray(ingredients)) {
            ingredients.forEach(ing => {
              if (typeof ing === 'object' && ing.name) {
                ingredientSet.add(ing.name.toLowerCase());
              } else if (typeof ing === 'string') {
                ingredientSet.add(ing.toLowerCase());
              }
            });
          } else if (typeof ingredients === 'object') {
            Object.values(ingredients).forEach(group => {
              if (Array.isArray(group)) processIngredients(group);
            });
          }
        };
        
        processIngredients(item.ingredients);
        return ingredientFilter.every(ing => {
          const normalizedIng = ing.toLowerCase();
          return ingredientSet.has(normalizedIng);
        });
      });
    }
    
    const ingredientCount = new Map();
    // Procesar y contar ingredientes disponibles
    const processIngredients = (ingredients, count = new Map()) => {
      if (Array.isArray(ingredients)) {
        ingredients.forEach(ing => {
          const name = typeof ing === 'object' ? ing.name : ing;
          if (name) {
            let normalizedName = name.toLowerCase().trim();
            if (normalizedName.startsWith('de ')) {
              normalizedName = normalizedName.slice(3);
            }
            count.set(normalizedName, (count.get(normalizedName) || 0) + 1);
          }
        });
      } else if (typeof ingredients === 'object') {
        Object.values(ingredients).forEach(group => {
          if (Array.isArray(group)) processIngredients(group, count);
        });
      }
      return count;
    };

    // Procesar ingredientes de las recetas filtradas
    for (const item of filteredData) {
      if (item.ingredients) {
        const itemIngredients = processIngredients(item.ingredients);
        itemIngredients.forEach((count, name) => {
          ingredientCount.set(name, (ingredientCount.get(name) || 0) + count);
        });
      }
    }

    const result = Array.from(ingredientCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Almacenar en caché
    if (!window._ingredientsCache) window._ingredientsCache = {};
    window._ingredientsCache[cacheKey] = result;
    
    return result;
  }

  const ingredients = getIngredients();

  const getCategories = () => {
    if (!originalData) return [];
    
    // Aplicar todos los filtros excepto el de categorías
    let filteredData = [...originalData];
    
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (countryFilter !== 'All') {
      filteredData = filteredData.filter(
        item => item.country && item.country.includes(countryFilter)
      );
    }
    
    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(
        item => item.difficulty && item.difficulty === difficultyFilter
      );
    }
    
    if (languageFilter !== 'All') {
      filteredData = filteredData.filter(
        item => item.language && item.language === languageFilter
      );
    }
    
    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(
        item => item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      );
    }
    
    if (ingredientFilter.length > 0) {
      filteredData = filteredData.filter(item => {
        if (!item.ingredients) return false;
        const ingredientSet = new Set();
        
        const processIngredients = (ingredients) => {
          if (Array.isArray(ingredients)) {
            ingredients.forEach(ing => {
              if (typeof ing === 'object' && ing.name) {
                ingredientSet.add(ing.name.toLowerCase());
              } else if (typeof ing === 'string') {
                ingredientSet.add(ing.toLowerCase());
              }
            });
          } else if (typeof ingredients === 'object') {
            Object.values(ingredients).forEach(group => {
              if (Array.isArray(group)) processIngredients(group);
            });
          }
        };
        
        processIngredients(item.ingredients);
        return ingredientFilter.every(ing => {
          const normalizedIng = ing.toLowerCase();
          return ingredientSet.has(normalizedIng);
        });
      });
    }
    
    const categoryCount = {};
    filteredData.forEach(item => {
      if (item.category) {
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        categories.forEach(category => {
          if (category && typeof category === 'string') {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  const categories = getCategories();

  const handleFilter = useCallback(searchTermValue => {
    if (!originalData || !Array.isArray(originalData)) {
      setAllData([])
      return
    }
    if (typeof searchTermValue !== 'string') {
      searchTermValue = ''
    }

    // Crear un Map para rastrear recetas únicas por ID
    const uniqueRecipes = new Map()
    let filteredData = [...originalData]

    // Aplicar filtros en orden
    if (searchTermValue && searchTermValue.trim() !== '') {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTermValue.toLowerCase().trim())
      )
    }

    // Eliminar duplicados basándose en el ID
    filteredData = filteredData.filter(item => {
      if (!uniqueRecipes.has(item.id)) {
        uniqueRecipes.set(item.id, true)
        return true
      }
      return false
    })

    if (countryFilter !== 'All') {
      filteredData = filteredData.filter(item =>
        item.country && item.country.includes(countryFilter)
      )
    }

    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(item =>
        item.difficulty === difficultyFilter
      )
    }

    if (languageFilter !== 'All') {
      filteredData = filteredData.filter(item =>
        item.language === languageFilter
      )
    }

    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(item =>
        item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      )
    }

    if (cookingTimeFilter !== 'All') {
      filteredData = filteredData.filter(item => {
        if (!item.cooking_time_value) return false;
        const timeValue = parseInt(item.cooking_time_value);
        switch(cookingTimeFilter) {
          case '15': return timeValue <= 15  && timeValue > 1;
          case '30': return timeValue <= 30  && timeValue > 1;
          case '45': return timeValue <= 45  && timeValue > 1;
          default: return true;
        }
      });
    }

    if (finalTimeFilter!== 'All') {
      filteredData = filteredData.filter(item => {
        if (!item.total_time_value) return false;
        if (finalTimeFilter === '>1h') return /h/i.test(item.total_time);
        const timeValue = parseInt(item.total_time_value);
        switch(finalTimeFilter) {
          case '15': return timeValue <= 15;
          case '30': return timeValue <= 30;
          case '45': return timeValue <= 45;
          case '60': return timeValue <= 60;
          case '90': return timeValue <= 90;
          case '120': return timeValue <= 120;
          case '>1h': return /h/i.test(item.total_time);
          default: return false;
        }
      })
    }

    if (categoryFilter.length > 0) {
      filteredData = filteredData.filter(item => {
        if (!item.category) return false
        const categories = Array.isArray(item.category) ? item.category : [item.category]
        return categoryFilter.some(cat => categories.includes(cat))
      })
    }

    if (ingredientFilter && ingredientFilter.length > 0) {
      filteredData = filteredData.filter(item => {
        if (!item.ingredients) return false;
        const getAllIngredientNames = (ingredients) => {
          let names = new Set();
          const processIngredient = (name) => {
            if (!name || typeof name !== 'string') return '';
            let processedName = name.toLowerCase().trim();
            if (processedName.startsWith('de ')) {
              processedName = processedName.slice(3);
            }
            return processedName;
          };

          const addIngredient = (ing) => {
            if (typeof ing === 'object' && ing.name) {
              names.add(processIngredient(ing.name));
            } else if (typeof ing === 'string') {
              names.add(processIngredient(ing));
            }
          };

          if (Array.isArray(ingredients)) {
            ingredients.forEach(addIngredient);
          } else if (typeof ingredients === 'object') {
            Object.values(ingredients).forEach(group => {
              if (Array.isArray(group)) {
                group.forEach(addIngredient);
              }
            });
          }
          return names;
        };
        
        const ingredientNames = getAllIngredientNames(item.ingredients);
        return ingredientFilter.every(ing => {
          if (!ing) return true;
          const processedFilter = ing.toLowerCase().startsWith('de ') ? 
            ing.toLowerCase().slice(3).trim() : 
            ing.toLowerCase().trim();
          return ingredientNames.has(processedFilter);
        });
      });
    }

    // Ordenar resultados
    filteredData = searchTermValue ? 
      filteredData.sort((a, b) => b.rating_count - a.rating_count) :
      filteredData.sort(() => Math.random() - 0.5)

    setAllData(filteredData)
  }, [originalData, countryFilter, difficultyFilter, languageFilter, starsFilter, categoryFilter, ingredientFilter, setAllData])

  useEffect(() => {
    const savedSearchTerm = localStorage.getItem('searchTerm');
    if (savedSearchTerm && originalData) {
      const filteredData = originalData.filter(item =>
        item.title.toLowerCase().includes(savedSearchTerm.toLowerCase())
      );
      setSearchTerm(savedSearchTerm);
      setAllData(filteredData);
      localStorage.removeItem('searchTerm');
    }
  }, [originalData, setSearchTerm, setAllData]);

  const debouncedHandleFilter = useCallback(
    debounce(handleFilter, 300),
    [handleFilter]
  );

  useEffect(() => {
    setIsHomePage(pathname === '/')
  }, [pathname])

  useEffect(() => {
    if (originalData) {
      handleFilter(searchTerm)
    }
  }, [searchTerm, countryFilter, difficultyFilter, languageFilter, starsFilter, categoryFilter, cookingTimeFilter, finalTimeFilter, handleFilter])

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
    setIngredientFilter([])
    setCookingTimeFilter('All')
    setFinalTimeFilter('All')
    handleFilter('')
  }

  const areFiltersActive = () => {
    return (
      searchTerm !== '' ||
      countryFilter !== 'All' ||
      difficultyFilter !== 'All' ||
      languageFilter !== 'All' ||
      starsFilter !== 'All' ||
      categoryFilter.length > 0 ||
      ingredientFilter.length > 0 ||
      finalTimeFilter!== 'All' ||
      cookingTimeFilter !== 'All'
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

    // Aplicar todos los filtros excepto el campo que estamos obteniendo
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
    
    if (cookingTimeFilter !== 'All' && field !== 'cooking_time') {
      filteredData = filteredData.filter(item => {
        if (!item.cooking_time_value) return false;
        const timeValue = parseInt(item.cooking_time_value);
        switch(cookingTimeFilter) {
          case '15': return timeValue <= 15  && timeValue > 1;
          case '30': return timeValue <= 30  && timeValue > 1;
          case '45': return timeValue <= 45;
          default: return true;
        }
      });
    }

    if (finalTimeFilter!== 'All' && field!== 'final_time') {
      filteredData = filteredData.filter(item => {
        if (!item.total_time_value) return false;
        const timeValue = parseInt(item.total_time_value);
        switch(finalTimeFilter) {
          case '15': return timeValue <= 15  && timeValue > 1;
          case '30': return timeValue <= 30  && timeValue > 1;
          case '45': return timeValue <= 45 && timeValue > 1;
          default: return true;
        }
      })
    }
    
    if (ingredientFilter.length > 0 && field !== 'ingredients') {
      filteredData = filteredData.filter(item => {
        if (!item.ingredients) return false;
        const ingredientSet = new Set();
        
        const processIngredients = (ingredients) => {
          if (Array.isArray(ingredients)) {
            ingredients.forEach(ing => {
              if (typeof ing === 'object' && ing.name) {
                ingredientSet.add(ing.name.toLowerCase());
              } else if (typeof ing === 'string') {
                ingredientSet.add(ing.toLowerCase());
              }
            });
          } else if (typeof ingredients === 'object') {
            Object.values(ingredients).forEach(group => {
              if (Array.isArray(group)) processIngredients(group);
            });
          }
        };
        
        processIngredients(item.ingredients);
        return ingredientFilter.every(ing => {
          const normalizedIng = ing.toLowerCase();
          return ingredientSet.has(normalizedIng);
        });
      });
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
    if (cookingTimeFilter !== 'All' && field !== 'cooking_time') {
      filteredData = filteredData.filter(item => {
        if (!item.cooking_time_value) return false;
        const timeValue = parseInt(item.cooking_time_value);
        switch(cookingTimeFilter) {
          case '15': return timeValue <= 15  && timeValue > 1;
          case '30': return timeValue <= 30  && timeValue > 1;
          case '45': return timeValue <= 45 && timeValue > 1;
          default: return true;
        }
      });
    }

    if (finalTimeFilter!== 'All' && field!== 'final_time') {
      filteredData = filteredData.filter(item => {
        if (!item.total_time_value) return false;
        const timeValue = parseInt(item.total_time_value);
        switch(finalTimeFilter) {
          case '15': return timeValue <= 15  && timeValue > 1;
          case '30': return timeValue <= 30  && timeValue > 1;
          case '45': return timeValue <= 45 && timeValue > 1;
          default: return true;
        }
      })
    }
    
    // Aplicar filtro de categoría si existe y no es el campo actual
    if (categoryFilter.length > 0 && field !== 'category') {
      filteredData = filteredData.filter(item => {
        if (!item.category) return false;
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        return categoryFilter.some(cat => categories.includes(cat));
      });
    }
    
    // Apply ingredient filter
    if (ingredientFilter.length > 0 && field !== 'ingredients') {
      filteredData = filteredData.filter(item => {
        if (!item.ingredients) return false;
        const ingredientSet = new Set();
        
        const processIngredients = (ingredients) => {
          if (Array.isArray(ingredients)) {
            ingredients.forEach(ing => {
              if (typeof ing === 'object' && ing.name) {
                ingredientSet.add(ing.name.toLowerCase());
              } else if (typeof ing === 'string') {
                ingredientSet.add(ing.toLowerCase());
              }
            });
          } else if (typeof ingredients === 'object') {
            Object.values(ingredients).forEach(group => {
              if (Array.isArray(group)) processIngredients(group);
            });
          }
        };
        
        processIngredients(item.ingredients);
        return ingredientFilter.every(ing => {
          const normalizedIng = ing.toLowerCase();
          return ingredientSet.has(normalizedIng);
        });
      });
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

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    debouncedHandleFilter(value)
  }

  return (
    <>
      <header tabIndex='-1' className='page-header'>
        <div className='w-full flex flex-row h-16 md:h-20 bg-neutral-800 border-b border-neutral-700 px-2 md:px-4 justify-between items-center'>
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
    <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 overflow-y-auto' onClick={closeModal}>
        <div className='relative w-full h-full md:h-auto flex items-start md:items-center justify-center p-4'>
            <div className='bg-neutral-900 border border-neutral-800 w-full md:w-2/3 rounded-lg shadow-xl flex flex-col' onClick={e => e.stopPropagation()}>
                <div className='p-4 md:p-8'>
                    <div className='flex justify-between items-center mb-4 md:mb-6'>
                        <h2 className='text-xl md:text-2xl font-semibold text-white'>Filtrar Recetas</h2>
                        <IoClose
                            className='text-2xl md:text-3xl text-gray-500 hover:text-red-600 transition-colors duration-200 cursor-pointer'
                            onClick={closeModal}
                        />
                    </div>

                    <div className='space-y-4 md:space-y-6 max-h-[70vh] md:max-h-[60vh] overflow-y-auto'>
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
                                    className='w-full p-2 md:p-3 border border-neutral-600 bg-neutral-900 text-white rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 text-sm md:text-base'
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
                                    className='w-full p-2 md:p-3 border border-neutral-600 bg-neutral-900 text-white rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 text-sm md:text-base'
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
                                    className='w-full p-2 md:p-3 border border-neutral-600 bg-neutral-900 text-white rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 text-sm md:text-base'
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
                                    className='w-full p-2 md:p-3 border border-neutral-600 bg-neutral-900 text-white rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200 text-sm md:text-base'
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
                                                : [...categoryFilter, category.name];
                                            setCategoryFilter(newFilter);
                                        }}
                                    >
                                        <div className='flex items-center'>
                                            <input
                                                type="checkbox"
                                                checked={categoryFilter.includes(category.name)}
                                                onChange={() => {
                                                    const newFilter = categoryFilter.includes(category.name)
                                                        ? categoryFilter.filter(cat => cat !== category.name)
                                                        : [...categoryFilter, category.name];
                                                    setCategoryFilter(newFilter);
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
                        <div className='space-y-2'>
                            <h2 className='text-2xl font-semibold mb-4 text-white'>Tiempo de preparación</h2>
                            <div className='grid grid-cols-3 gap-4 bg-neutral-900 rounded-lg p-4'>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '15' ? 'All' : '15')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '15'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≤ 15</div>
                                    <div className='text-sm text-white'>minutos</div>
                                </div>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '30' ? 'All' : '30')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '30'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≤ 30</div>
                                    <div className='text-sm text-white'>minutos</div>
                                </div>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '45' ? 'All' : '45')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '45'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≤ 45</div>
                                    <div className='text-sm text-white'>minutos</div>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <h2 className='text-2xl font-semibold mb-4 text-white'>Tiempo Total</h2>
                            <div className='grid grid-cols-4 gap-4 bg-neutral-900 rounded-lg p-4'>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '15' ? 'All' : '15')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '15'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≤ 15</div>
                                    <div className='text-sm text-white'>minutos</div>
                                </div>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '30' ? 'All' : '30')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '30'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≤ 30</div>
                                    <div className='text-sm text-white'>minutos</div>
                                </div>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '45' ? 'All' : '45')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '45'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≤ 45</div>
                                    <div className='text-sm text-white'>minutos</div>
                                </div>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '>1h' ? 'All' : '>1h')}
                                    className={`text-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '>1h'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-2xl font-bold text-white'>≥ 1</div>
                                    <div className='text-sm text-white'>hora</div>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <h3 className='text-lg font-semibold text-white'>Ingredientes</h3>
                            <div className='relative mb-4'>
                                <input
                                    type='text'
                                    placeholder='Buscar ingredientes...'
                                    className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                                    onChange={(e) => {
                                        const searchValue = e.target.value.toLowerCase();
                                        requestAnimationFrame(() => {
                                            const ingredientsList = document.querySelector('.ingredients-list');
                                            if (ingredientsList) {
                                                Array.from(ingredientsList.children).forEach(child => {
                                                    const ingredientName = child.querySelector('span').textContent.toLowerCase();
                                                    child.style.display = ingredientName.includes(searchValue) ? 'flex' : 'none';
                                                });
                                            }
                                        });
                                    }}
                                />
                            </div>
                            <div className='space-y-2 max-h-60 overflow-y-auto ingredients-list'>
                                {ingredients.map((ingredient) => (
                                    <div
                                        key={ingredient.name}
                                        className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer transition-colors duration-200'
                                        onClick={() => {
                                            const newFilter = ingredientFilter.includes(ingredient.name)
                                                ? ingredientFilter.filter(ing => ing !== ingredient.name)
                                                : [...ingredientFilter, ingredient.name];
                                            setIngredientFilter(newFilter);
                                        }}
                                    >
                                        <div className='flex items-center'>
                                            <input
                                                type="checkbox"
                                                checked={ingredientFilter.includes(ingredient.name)}
                                                onChange={() => {
                                                    const newFilter = ingredientFilter.includes(ingredient.name)
                                                        ? ingredientFilter.filter(ing => ing !== ingredient.name)
                                                        : [...ingredientFilter, ingredient.name];
                                                    setIngredientFilter(newFilter);
                                                }}
                                                className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                            />
                                            <span className='ml-3 text-white'>{ingredient.name}</span>
                                        </div>
                                        <span className='text-gray-400'>{ingredient.count} resultados</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='sticky bottom-0 bg-neutral-900 py-4 border-t border-neutral-700 p-4 md:p-8'>
                    <div className='flex justify-end gap-x-2 md:gap-x-4'>
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