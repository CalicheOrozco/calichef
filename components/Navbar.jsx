/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { CalichefContext } from '../context/MyContext'
import { FaSearch, FaStar, FaUserCircle } from 'react-icons/fa'
import { IoClose, IoHomeSharp } from 'react-icons/io5'
import Link from 'next/link'
import { countryMap } from '../constants';

const debounce = (func, wait = 1000) => {
  let timeout
  return (...args) => {
    const context = this
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

export default function Navbar ({countRecipies }) {
  const [isHomePage, setIsHomePage] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  // Estado para las sugerencias automáticas
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Importar contexto de autenticación directamente
  const { useAuth } = require('@/context/AuthContext')
  const { user, logout, isAuthenticated } = useAuth()


  const contextValue = useContext(CalichefContext)
  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Navbar')
    return null
  }


  const {
    setAllData,
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [cookingTimeFilter, setCookingTimeFilter] = useState('All')
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [finalTimeFilter, setFinalTimeFilter] = useState('All')



  const getCategories = () => {
    if (!originalData) return [];
    
    // Aplicar todos los filtros excepto el de categorías
    let filteredData = [...originalData];
    
    if (searchTerm) {
      filteredData = filteredData.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (!countryFilter.includes('All')) {
      filteredData = filteredData.filter(
        item => item.country && countryFilter.some(country => item.country.includes(country))
      );
    }
    
    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(
        item => item.difficulty && item.difficulty === difficultyFilter
      );
    }
    
    if (!languageFilter.includes('All')) {
      filteredData = filteredData.filter(
        item => item.language && languageFilter.includes(item.language)
      );
    }
    
    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(
        item => item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      );
    }
    
    // Aplicar filtros de tiempo si están activos
    if (cookingTimeFilter !== 'All') {
      filteredData = filteredData.filter(item => {
        if (!item.cooking_time) return false;
        
        // Usamos una expresión regular para encontrar los números seguidos de sus unidades
        const matches = item.cooking_time.match(/(\d+)\s*(h|min)/gi);

        let totalMinutes = 0;

        if (matches) {
          matches.forEach(match => {
            // Extraemos los valores numéricos y las unidades de cada coincidencia
            const numberMatch = match.match(/(\d+)/);
            const unitMatch = match.match(/(h|min)/i);
            
            if (numberMatch && unitMatch) {
              const value = parseInt(numberMatch[1]);
              const unit = unitMatch[1].toLowerCase();

              // Si es 'h', lo multiplicamos por 60 para convertirlo a Minutos
              if (unit === 'h') {
                totalMinutes += value * 60;
              } else if (unit === 'min') {
                totalMinutes += value;
              }
            }
          });
        }
        
        // Si no hay coincidencias o el tiempo total es 0, verificamos si hay un formato diferente
        if ((!matches || matches.length === 0 || totalMinutes === 0) && item.cooking_time) {
          // Intentar extraer directamente un número si no hay unidades
          const directNumber = parseInt(item.cooking_time);
          if (!isNaN(directNumber)) {
            totalMinutes = directNumber;
          }
        }
        
        // Si aún no tenemos un valor válido, retornamos false
        if (totalMinutes === 0) return false;
        
        switch(cookingTimeFilter) {
          case '15': return totalMinutes <= 15;
          case '30': return totalMinutes <= 30;
          case '45': return totalMinutes <= 45;
          case '60': return totalMinutes >= 60;
          default: return true;
        }
      });
    }
    
    if (finalTimeFilter !== 'All') {
      filteredData = filteredData.filter(item => {
        if (!item.total_time) return false;
        
        // Caso especial para tiempos mayores a 1 Hora
        if (finalTimeFilter === '>1h') {
          return /h/i.test(item.total_time);
        }
        
        // Usamos una expresión regular para encontrar los números seguidos de sus unidades
        const matches = item.total_time.match(/(\d+)\s*(h|min)/gi);

        let totalMinutes = 0;

        if (matches) {
          matches.forEach(match => {
            // Extraemos los valores numéricos y las unidades de cada coincidencia
            const numberMatch = match.match(/(\d+)/);
            const unitMatch = match.match(/(h|min)/i);
            
            if (numberMatch && unitMatch) {
              const value = parseInt(numberMatch[1]);
              const unit = unitMatch[1].toLowerCase();

              // Si es 'h', lo multiplicamos por 60 para convertirlo a Minutos
              if (unit === 'h') {
                totalMinutes += value * 60;
              } else if (unit === 'min') {
                totalMinutes += value;
              }
            }
          });
        }
        
        // Si no hay coincidencias o el tiempo total es 0, verificamos si hay un formato diferente
        if ((!matches || matches.length === 0 || totalMinutes === 0) && item.total_time) {
          // Intentar extraer directamente un número si no hay unidades
          const directNumber = parseInt(item.total_time);
          if (!isNaN(directNumber)) {
            totalMinutes = directNumber;
          }
        }
        
        // Si aún no tenemos un valor válido, retornamos false
        if (totalMinutes === 0) return false;
        
        switch(finalTimeFilter) {
          case '15': return totalMinutes <= 15;
          case '30': return totalMinutes <= 30;
          case '45': return totalMinutes <= 45;
          case '60': return totalMinutes <= 60;
          case '90': return totalMinutes <= 90;
          case '120': return totalMinutes <= 120;
          default: return true; // Por defecto incluimos la receta si el filtro no coincide
        }
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

  // Función para generar sugerencias basadas en el término de búsqueda
  const generateSuggestions = useCallback((searchTermValue) => {
    if (!originalData || !Array.isArray(originalData) || !searchTermValue || searchTermValue.trim() === '') {
      setSuggestions([])
      return
    }

    const searchTermLower = searchTermValue.toLowerCase().trim()
    const searchTerms = searchTermLower.split(' ')
    
    // Buscar coincidencias parciales en los títulos
    let matchedRecipes = originalData.filter(item => {
      const titleLower = item.title.toLowerCase()
      
      // Verificar si al menos un término de búsqueda está incluido en el título
      return searchTerms.some(term => titleLower.includes(term))
    })
    
    // Aplicar filtro de idioma si está activo
    if (!languageFilter.includes('All')) {
      matchedRecipes = matchedRecipes.filter(item => 
        item.language && languageFilter.includes(item.language)
      )
    }
    
    // Ordenar por relevancia (cuántos términos coinciden) y por puntuación
    matchedRecipes = matchedRecipes.sort((a, b) => {
      const titleA = a.title.toLowerCase()
      const titleB = b.title.toLowerCase()
      
      // Contar cuántos términos coinciden en cada título
      const matchesA = searchTerms.filter(term => titleA.includes(term)).length
      const matchesB = searchTerms.filter(term => titleB.includes(term)).length
      
      // Primero ordenar por número de coincidencias
      if (matchesB !== matchesA) {
        return matchesB - matchesA
      }
      
      // Si tienen el mismo número de coincidencias, ordenar por puntuación
      return (b.rating_score || 0) - (a.rating_score || 0)
    })
    
    // Limitar a 5 sugerencias para no sobrecargar la interfaz
    setSuggestions(matchedRecipes.slice(0, 5))
  }, [originalData, languageFilter])

  const handleFilter = useCallback(searchTermValue => {
    if (!originalData || !Array.isArray(originalData)) {
      setAllData([])
      return
    }
    if (typeof searchTermValue !== 'string') {
      searchTermValue = ''
    }

    // Optimización: Salir temprano si no hay término de búsqueda ni filtros activos
    if (!searchTermValue && 
        countryFilter.includes('All') && 
        difficultyFilter === 'All' && 
        languageFilter.includes('All') && 
        starsFilter === 'All' && 
        cookingTimeFilter === 'All' && 
        finalTimeFilter === 'All' && 
        categoryFilter.length === 0) {
      setAllData(originalData)
      return
    }

    // Crear un Map para rastrear recetas únicas por ID
    const uniqueRecipes = new Map()
    let filteredData = [...originalData]

    // Aplicar filtros en orden
    if (searchTermValue && searchTermValue.trim() !== '') {
      const searchTermLower = searchTermValue.toLowerCase().trim()
      const searchTerms = searchTermLower.split(' ')
      filteredData = filteredData.filter(item =>
        searchTerms.every(term =>
          item.title.toLowerCase().includes(term)
        )
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

    if (!countryFilter.includes('All')) {
      filteredData = filteredData.filter(item =>
        item.country && countryFilter.some(country => item.country.includes(country))
      )
    }

    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(item =>
        item.difficulty === difficultyFilter
      )
    }

    if (!languageFilter.includes('All')) {
      filteredData = filteredData.filter(item =>
        item.language && languageFilter.includes(item.language)
      )
    }

    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(item =>
        item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      )
    }

    if (cookingTimeFilter !== 'All') {
      filteredData = filteredData.filter(item => {
        if (!item.cooking_time) return false;
        
        // Usamos una expresión regular para encontrar los números seguidos de sus unidades
        const matches = item.cooking_time.match(/(\d+)\s*(h|min)/gi);

        let totalMinutes = 0;

        if (matches) {
          matches.forEach(match => {
            // Extraemos los valores numéricos y las unidades de cada coincidencia
            const numberMatch = match.match(/(\d+)/);
            const unitMatch = match.match(/(h|min)/i);
            
            if (numberMatch && unitMatch) {
              const value = parseInt(numberMatch[1]);
              const unit = unitMatch[1].toLowerCase();

              // Si es 'h', lo multiplicamos por 60 para convertirlo a Minutos
              if (unit === 'h') {
                totalMinutes += value * 60;
              } else if (unit === 'min') {
                totalMinutes += value;
              }
            }
          });
        }
        
        // Si no hay coincidencias o el tiempo total es 0, verificamos si hay un formato diferente
        if ((!matches || matches.length === 0 || totalMinutes === 0) && item.cooking_time) {
          // Intentar extraer directamente un número si no hay unidades
          const directNumber = parseInt(item.cooking_time);
          if (!isNaN(directNumber)) {
            totalMinutes = directNumber;
          }
        }
        
        // Si aún no tenemos un valor válido, retornamos false
        if (totalMinutes === 0) return false;
        
        switch(cookingTimeFilter) {
          case '15': return totalMinutes <= 15;
          case '30': return totalMinutes <= 30;
          case '45': return totalMinutes <= 45;
          case '60': return totalMinutes >= 60;
          default: return true;
        }
      });
    }

    if (finalTimeFilter !== 'All') {
      filteredData = filteredData.filter(item => {
        if (!item.total_time) return false;
        
        // Caso especial para tiempos mayores a 1 Hora
        if (finalTimeFilter === '>1h') {
          return /h/i.test(item.total_time);
        }
        
        // Usamos una expresión regular para encontrar los números seguidos de sus unidades
        const matches = item.total_time.match(/(\d+)\s*(h|min)/gi);

        let totalMinutes = 0;

        if (matches) {
          matches.forEach(match => {
            // Extraemos los valores numéricos y las unidades de cada coincidencia
            const numberMatch = match.match(/(\d+)/);
            const unitMatch = match.match(/(h|min)/i);
            
            if (numberMatch && unitMatch) {
              const value = parseInt(numberMatch[1]);
              const unit = unitMatch[1].toLowerCase();

              // Si es 'h', lo multiplicamos por 60 para convertirlo a Minutos
              if (unit === 'h') {
                totalMinutes += value * 60;
              } else if (unit === 'min') {
                totalMinutes += value;
              }
            }
          });
        }
        
        // Si no hay coincidencias o el tiempo total es 0, verificamos si hay un formato diferente
        if ((!matches || matches.length === 0 || totalMinutes === 0) && item.total_time) {
          // Intentar extraer directamente un número si no hay unidades
          const directNumber = parseInt(item.total_time);
          if (!isNaN(directNumber)) {
            totalMinutes = directNumber;
          }
        }
        
        // Si aún no tenemos un valor válido, retornamos false
        if (totalMinutes === 0) return false;
        
        switch(finalTimeFilter) {
          case '15': return totalMinutes <= 15;
          case '30': return totalMinutes <= 30;
          case '45': return totalMinutes <= 45;
          case '60': return totalMinutes <= 60;
          case '90': return totalMinutes <= 90;
          case '120': return totalMinutes <= 120;
          default: return true; // Por defecto incluimos la receta si el filtro no coincide
        }
      });
    }

    if (categoryFilter.length > 1) {
      filteredData = filteredData.filter(item => {
        if (!item.category) return false
        const categories = Array.isArray(item.category) ? item.category : [item.category]
        return categoryFilter.some(cat => categories.includes(cat))
      })
    }

    // Ordenar resultados
    filteredData = searchTermValue ? 
      filteredData.sort((a, b) => b.rating_count - a.rating_count) :
      filteredData.sort(() => Math.random() - 0.5)

    setAllData(filteredData)
  }, [originalData, countryFilter, difficultyFilter, languageFilter, starsFilter, categoryFilter, cookingTimeFilter, finalTimeFilter, setAllData])

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
    
    // Cerrar sugerencias cuando se hace clic fuera del componente
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [originalData, setSearchTerm, setAllData]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const debouncedHandleFilter = useCallback(
    debounce(handleFilter, 500),
    [handleFilter]
  );
  
  // Debounce para las sugerencias (más rápido que el filtro principal)
  const debouncedGenerateSuggestions = useCallback(
    debounce(generateSuggestions, 200),
    [generateSuggestions]
  );

  useEffect(() => {
    setIsHomePage(pathname === '/')
  }, [pathname])

  useEffect(() => {
    if (originalData) {
      debouncedHandleFilter(searchTerm)
    }
  }, [searchTerm, countryFilter, difficultyFilter, languageFilter, starsFilter, categoryFilter, cookingTimeFilter, finalTimeFilter, debouncedHandleFilter])

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
      setShowSuggestions(false)
    } else if (event.key === 'ArrowDown' && suggestions.length > 0) {
      // Permitir navegar por las sugerencias con las flechas
      const suggestionElements = document.querySelectorAll('.suggestion-item');
      if (suggestionElements.length > 0) {
        suggestionElements[0].focus();
      }
    }
  }
  
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      debouncedGenerateSuggestions(value);
      setShowSuggestions(true);
    }
    debouncedHandleFilter(value);
  }
  
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.title);
    setShowSuggestions(false);
    handleFilter(suggestion.title);
    closeModal();
    if (!isHomePage) {
      router.push('/');
    }
  }
  
  const handleSuggestionKeyDown = (event, index, suggestion) => {
    if (event.key === 'Enter') {
      handleSuggestionClick(suggestion);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const suggestionElements = document.querySelectorAll('.suggestion-item');
      if (index < suggestionElements.length - 1) {
        suggestionElements[index + 1].focus();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index > 0) {
        const suggestionElements = document.querySelectorAll('.suggestion-item');
        suggestionElements[index - 1].focus();
      } else {
        // Volver al input de búsqueda
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setCountryFilter(['All'])
    setDifficultyFilter('All')
    setLanguageFilter(['All'])
    setStarsFilter('All')
    setCategoryFilter([])

    setCookingTimeFilter('All')
    setFinalTimeFilter('All')
    handleFilter('')
  }

  const areFiltersActive = () => {
    return (
      searchTerm !== '' ||
      !countryFilter.includes('All') ||
      difficultyFilter !== 'All' ||
      !languageFilter.includes('All') ||
      starsFilter !== 'All' ||
      categoryFilter.length > 1 ||
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
    'EN': 'English',
    'FR': 'Français',
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
    
    if (!countryFilter.includes('All') && field !== 'country') {
      filteredData = filteredData.filter(
        item => item.country && countryFilter.some(country => item.country.includes(country))
      );
    }
    
    if (difficultyFilter !== 'All' && field !== 'difficulty') {
      filteredData = filteredData.filter(
        item => item.difficulty && item.difficulty === difficultyFilter
      );
    }
    
    if (!languageFilter.includes('All') && field !== 'language') {
      filteredData = filteredData.filter(
        item => item.language && languageFilter.includes(item.language)
      );
    }
    
    if (starsFilter !== 'All' && field !== 'rating') {
      filteredData = filteredData.filter(
        item => item.rating_score && Math.floor(parseFloat(item.rating_score)) === parseInt(starsFilter)
      );
    }
    
    if (cookingTimeFilter !== 'All' && field !== 'cooking_time') {
      filteredData = filteredData.filter(item => {
        if (!item.cooking_time) return false;
        
        // Usamos una expresión regular para encontrar los números seguidos de sus unidades
        const matches = item.cooking_time.match(/(\d+)\s*(h|min)/gi);

        let totalMinutes = 0;

        if (matches) {
          matches.forEach(match => {
            // Extraemos los valores numéricos y las unidades de cada coincidencia
            const numberMatch = match.match(/(\d+)/);
            const unitMatch = match.match(/(h|min)/i);
            
            if (numberMatch && unitMatch) {
              const value = parseInt(numberMatch[1]);
              const unit = unitMatch[1].toLowerCase();

              // Si es 'h', lo multiplicamos por 60 para convertirlo a Minutos
              if (unit === 'h') {
                totalMinutes += value * 60;
              } else if (unit === 'min') {
                totalMinutes += value;
              }
            }
          });
        }
        
        // Si no hay coincidencias o el tiempo total es 0, verificamos si hay un formato diferente
        if ((!matches || matches.length === 0 || totalMinutes === 0) && item.cooking_time) {
          // Intentar extraer directamente un número si no hay unidades
          const directNumber = parseInt(item.cooking_time);
          if (!isNaN(directNumber)) {
            totalMinutes = directNumber;
          }
        }
        
        // Si aún no tenemos un valor válido, retornamos false
        if (totalMinutes === 0) return false;
        
        switch(cookingTimeFilter) {
          case '15': return totalMinutes <= 15;
          case '30': return totalMinutes <= 30;
          case '45': return totalMinutes <= 45;
          case '60': return totalMinutes >= 60;
          default: return true;
        }
      });
    }

    if (finalTimeFilter !== 'All' && field !== 'final_time') {
      filteredData = filteredData.filter(item => {
        if (!item.total_time) return false;
        
        // Caso especial para tiempos mayores a 1 Hora
        if (finalTimeFilter === '>1h') {
          return /h/i.test(item.total_time);
        }
        
        // Usamos una expresión regular para encontrar los números seguidos de sus unidades
        const matches = item.total_time.match(/(\d+)\s*(h|min)/gi);

        let totalMinutes = 0;

        if (matches) {
          matches.forEach(match => {
            // Extraemos los valores numéricos y las unidades de cada coincidencia
            const numberMatch = match.match(/(\d+)/);
            const unitMatch = match.match(/(h|min)/i);
            
            if (numberMatch && unitMatch) {
              const value = parseInt(numberMatch[1]);
              const unit = unitMatch[1].toLowerCase();

              // Si es 'h', lo multiplicamos por 60 para convertirlo a Minutos
              if (unit === 'h') {
                totalMinutes += value * 60;
              } else if (unit === 'min') {
                totalMinutes += value;
              }
            }
          });
        }
        
        // Si no hay coincidencias o el tiempo total es 0, verificamos si hay un formato diferente
        if ((!matches || matches.length === 0 || totalMinutes === 0) && item.total_time) {
          // Intentar extraer directamente un número si no hay unidades
          const directNumber = parseInt(item.total_time);
          if (!isNaN(directNumber)) {
            totalMinutes = directNumber;
          }
        }
        
        // Si aún no tenemos un valor válido, retornamos false
        if (totalMinutes === 0) return false;
        
        switch(finalTimeFilter) {
          case '15': return totalMinutes <= 15;
          case '30': return totalMinutes <= 30;
          case '45': return totalMinutes <= 45;
          case '60': return totalMinutes <= 60;
          case '90': return totalMinutes <= 90;
          case '120': return totalMinutes <= 120;
          default: return true;
        }
      });
    }
    
    // Aplicar filtro de categoría si existe y no es el campo actual
    if (categoryFilter.length > 1 && field !== 'category') {
      filteredData = filteredData.filter(item => {
        if (!item.category) return false;
        const categories = Array.isArray(item.category) ? item.category : [item.category];
        return categoryFilter.some(cat => categories.includes(cat));
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
            {/* User Authentication Section */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <div
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 text-green-600"
                >
                  <FaUserCircle className="text-2xl  hover:text-green-300 transition-colors" />
                </div>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-white font-semibold border-b">
                      {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
                    </div>
                    <Link href="/profile" passHref>
                      <span className="block px-4 py-2 text-sm text-white hover:text-black hover:bg-white cursor-pointer">
                        Ver perfil
                      </span>
                    </Link>
                    <Link href="/favorites" passHref>
                      <span className="block px-4 py-2 text-sm text-white hover:text-black hover:bg-white cursor-pointer">
                      Favoritos
                      </span>
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" ref={menuRef}>
                <div
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 text-green-600"
                >
                  <FaUserCircle className="text-2xl  hover:text-green-300 transition-colors" />
                </div>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg py-2 z-50">
                    <Link href="/login" passHref>
                      <button
                        className="block w-full text-left bg-black px-4 py-2 text-sm text-green-600 hover:bg-green-100"
                      >
                        Login
                      </button>
                    </Link>
                    <Link href="/register" passHref>
                      <button
                        className="block w-full text-left  bg-black px-4 py-2  text-sm text-blue-600 hover:bg-blue-100"
                      >
                        Register
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {isModalOpen && (
    <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 overflow-y-auto' onClick={closeModal}>
        <div className='relative w-full h-full md:h-auto flex items-start md:items-center justify-center p-4'>
            <div className='bg-neutral-900 border border-neutral-800 w-full md:w-5/6 rounded-lg shadow-xl flex flex-col' onClick={e => e.stopPropagation()}>
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
                                onChange={handleSearchInputChange}
                                onKeyPress={handleKeyPress}
                                ref={searchInputRef}
                                className='w-full px-3 md:px-4 py-2 md:py-3 border-2 border-neutral-700 bg-neutral-700 text-white rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm md:text-base'
                                aria-label='Buscar'
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div 
                                    ref={suggestionsRef}
                                    className='absolute z-50 mt-1 w-full bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-y-auto'
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={suggestion.id}
                                            className='suggestion-item px-4 py-2 hover:bg-neutral-700 cursor-pointer text-white'
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            onKeyDown={(e) => handleSuggestionKeyDown(e, index, suggestion)}
                                            tabIndex={0}
                                        >
                                            {suggestion.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold text-white'>País</h3>
                                <div className='space-y-2 max-h-60 overflow-y-auto'>
                                    <div
                                        className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                                        onClick={() => {
                                            if (countryFilter.includes('All')) {
                                                setCountryFilter([]);
                                            } else {
                                                setCountryFilter(['All']);
                                            }
                                        }}
                                    >
                                        <div className='flex items-center'>
                                            <input
                                                type="checkbox"
                                                checked={countryFilter.includes('All')}
                                                onChange={() => {
                                                    if (countryFilter.includes('All')) {
                                                        setCountryFilter([]);
                                                    } else {
                                                        setCountryFilter(['All']);
                                                    }
                                                }}
                                                className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                            />
                                            <span className='ml-3 text-white'>Todos los países</span>
                                        </div>
                                    </div>
                                    {getAvailableOptions('country').map(({ code, name }) => {
                                        // Contar cuántas recetas hay para este país
                                        const countryCount = originalData ? originalData.filter(item => 
                                            item.country && item.country.includes(code)
                                        ).length : 0;
                                        
                                        // Obtener la URL de la bandera del país
                                        const flagUrl = countryMap[`${code}img`];
                                        
                                        return (
                                            <div
                                                key={code}
                                                className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                                                onClick={() => {
                                                    const newFilter = countryFilter.includes(code)
                                                        ? countryFilter.filter(country => country !== code)
                                                        : [...countryFilter.filter(country => country !== 'All'), code];
                                                    setCountryFilter(newFilter.length ? newFilter : ['All']);
                                                }}
                                            >
                                                <div className='flex items-center'>
                                                    <input
                                                        type="checkbox"
                                                        checked={countryFilter.includes(code)}
                                                        onChange={() => {
                                                            const newFilter = countryFilter.includes(code)
                                                                ? countryFilter.filter(country => country !== code)
                                                                : [...countryFilter.filter(country => country !== 'All'), code];
                                                            setCountryFilter(newFilter.length ? newFilter : ['All']);
                                                        }}
                                                        className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                                    />
                                                    {flagUrl && (
                                                        <img 
                                                            src={flagUrl} 
                                                            alt={`Bandera de ${name}`} 
                                                            className='ml-3 w-5 h-5 rounded-sm object-cover'
                                                        />
                                                    )}
                                                    <span className='ml-2 text-white'>{name}</span>
                                                </div>
                                                <span className='text-gray-400'>{countryCount} resultados</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold text-white'>Dificultad</h3>
                                <div className='space-y-2 max-h-60 overflow-y-auto'>
                                    <div
                                        className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                                        onClick={() => setDifficultyFilter('All')}
                                    >
                                        <div className='flex items-center'>
                                            <input
                                                type="checkbox"
                                                checked={difficultyFilter === 'All'}
                                                onChange={() => setDifficultyFilter('All')}
                                                className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                            />
                                            <span className='ml-3 text-white'>Todas las dificultades</span>
                                        </div>
                                    </div>
                                    {getAvailableOptions('difficulty').map(({ code, name }) => {
                                        // Contar cuántas recetas hay para esta dificultad
                                        const difficultyCount = originalData ? originalData.filter(item => 
                                            item.difficulty && item.difficulty === code
                                        ).length : 0;
                                        
                                        return (
                                            <div
                                                key={code}
                                                className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                                                onClick={() => setDifficultyFilter(difficultyFilter === code ? 'All' : code)}
                                            >
                                                <div className='flex items-center'>
                                                    <input
                                                        type="checkbox"
                                                        checked={difficultyFilter === code}
                                                        onChange={() => setDifficultyFilter(difficultyFilter === code ? 'All' : code)}
                                                        className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                                    />
                                                    <span className='ml-3 text-white'>{name}</span>
                                                </div>
                                                <span className='text-gray-400'>{difficultyCount} resultados</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <h3 className='text-lg font-semibold text-white'>Idioma</h3>
                                <div className='space-y-2 max-h-60 overflow-y-auto'>
                                    <div
                                        className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                                        onClick={() => {
                                            if (languageFilter.includes('All')) {
                                                setLanguageFilter([]);
                                            } else {
                                                setLanguageFilter(['All']);
                                            }
                                        }}
                                    >
                                        <div className='flex items-center'>
                                            <input
                                                type="checkbox"
                                                checked={languageFilter.includes('All')}
                                                onChange={() => {
                                                    if (languageFilter.includes('All')) {
                                                        setLanguageFilter([]);
                                                    } else {
                                                        setLanguageFilter(['All']);
                                                    }
                                                }}
                                                className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                            />
                                            <span className='ml-3 text-white'>Todos los idiomas</span>
                                        </div>
                                    </div>
                                    {getAvailableOptions('language').map(({ code, name }) => {
                                        // Contar cuántas recetas hay para este idioma
                                        const languageCount = originalData ? originalData.filter(item => 
                                            item.language && item.language === code
                                        ).length : 0;
                                        
                                        return (
                                            <div
                                                key={code}
                                                className='flex items-center justify-between p-2 hover:bg-neutral-700 rounded-lg cursor-pointer'
                                                onClick={() => {
                                                    const newFilter = languageFilter.includes(code)
                                                        ? languageFilter.filter(lang => lang !== code)
                                                        : [...languageFilter.filter(lang => lang !== 'All'), code];
                                                    setLanguageFilter(newFilter.length ? newFilter : ['All']);
                                                }}
                                            >
                                                <div className='flex items-center'>
                                                    <input
                                                        type="checkbox"
                                                        checked={languageFilter.includes(code)}
                                                        onChange={() => {
                                                            const newFilter = languageFilter.includes(code)
                                                                ? languageFilter.filter(lang => lang !== code)
                                                                : [...languageFilter.filter(lang => lang !== 'All'), code];
                                                            setLanguageFilter(newFilter.length ? newFilter : ['All']);
                                                        }}
                                                        className='w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500'
                                                    />
                                                    <span className='ml-3 text-white'>{name}</span>
                                                </div>
                                                <span className='text-gray-400'>{languageCount} resultados</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 md:gap-1 sm:gap-4 bg-neutral-900 rounded-lg p-3 sm:p-4">
                            {[1, 2, 3, 4, 5].map((starCount) => (
                              <div
                                key={starCount}
                                onClick={() =>
                                  setStarsFilter(starsFilter === String(starCount) ? 'All' : String(starCount))
                                }
                                className={`
                                  text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200
                                  w-full sm:w-[48%] md:${starCount === 5 ? 'w-[64%]' : 'w-[31%]'}
                                  ${starsFilter === String(starCount) ? 'bg-green-600 text-white' : 'hover:bg-neutral-800'}
                                `}
                              >
                                <div className="flex justify-center">
                                  {Array.from({ length: starCount }).map((_, i) => (
                                    <FaStar key={i} className="text-yellow-500 text-xl sm:text-2xl" />
                                  ))}
                                </div>
                              </div>
                            ))}
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
                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-neutral-900 rounded-lg p-3 sm:p-4'>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '15' ? 'All' : '15')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '15'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≤ 15</div>
                                    <div className='text-xs sm:text-sm text-white'>Minutos</div>
                                </div>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '30' ? 'All' : '30')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '30'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≤ 30</div>
                                    <div className='text-xs sm:text-sm text-white'>Minutos</div>
                                </div>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '45' ? 'All' : '45')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '45'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≤ 45</div>
                                    <div className='text-xs sm:text-sm text-white'>Minutos</div>
                                </div>
                                <div
                                    onClick={() => setCookingTimeFilter(cookingTimeFilter === '60' ? 'All' : '60')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        cookingTimeFilter === '60'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≥ 1</div>
                                    <div className='text-xs sm:text-sm text-white'>Hora</div>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <h2 className='text-2xl font-semibold mb-4 text-white'>Tiempo Total</h2>
                            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-neutral-900 rounded-lg p-3 sm:p-4'>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '15' ? 'All' : '15')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '15'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≤ 15</div>
                                    <div className='text-xs sm:text-sm text-white'>Minutos</div>
                                </div>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '30' ? 'All' : '30')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '30'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≤ 30</div>
                                    <div className='text-xs sm:text-sm text-white'>Minutos</div>
                                </div>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '45' ? 'All' : '45')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '45'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≤ 45</div>
                                    <div className='text-xs sm:text-sm text-white'>Minutos</div>
                                </div>
                                <div
                                    onClick={() => setFinalTimeFilter(finalTimeFilter === '>1h' ? 'All' : '>1h')}
                                    className={`text-center p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        finalTimeFilter === '>1h'
                                            ? 'bg-green-600 text-white'
                                            : 'hover:bg-neutral-800'
                                    }`}
                                >
                                    <div className='text-xl sm:text-2xl font-bold text-white'>≥ 1</div>
                                    <div className='text-xs sm:text-sm text-white'>Hora</div>
                                </div>
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
                            Show {countRecipies} results
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