import React, { useContext, useState, useEffect, useCallback } from 'react'
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
    }
    if (countryFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.Country &&
          item.Country.toLowerCase() === countryFilter.toLowerCase()
      )
    }
    if (difficultyFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.Dificultad &&
          item.Dificultad.toLowerCase() === difficultyFilter.toLowerCase()
      )
    }
    if (languageFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.language &&
          item.language.toLowerCase() === languageFilter.toLowerCase()
      )
    }
    if (starsFilter !== 'All') {
      filteredData = filteredData.filter(
        item =>
          item.rating_score &&
          Math.floor(item.rating_score) === parseInt(starsFilter)
      )
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
    if (typeof window !== 'undefined') {
      setIsHomePage(window.location.pathname === '/')
    }
  }, [])

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
  }
  return (
    <>
      <header tabIndex='-1' className='page-header'>
        <div className='w-full flex flex-row h-20 bg-white md:h-full px-4 justify-between items-center'>
          <Link href='/' className='w-96' passHref>
            <img className='' src='/calichefLogo.png' alt='Calichef Logo' />
          </Link>

          <div className='w-full flex text-green-600 flex-row justify-end items-center md:items-center'>
            {userRecipes && userRecipes.length > 0 ? (
              <Link href='/recipes' passHref>
                <div className='flex justify-center items-center hover:text-green-300'>
                  <span className='text-xl'>({userRecipes.length})</span>
                  <IoRestaurant className='mx-2 cursor-pointer text-3xl ' />
                </div>
              </Link>
            ) : null}
            <div>
              <Link href='/' passHref>
                <div className='flex items-center cursor-pointer'>
                  <IoHomeSharp className='text-green-600 hover:text-green-300 text-3xl' />
                </div>
              </Link>
            </div>
            {isHomePage ? (
              <FaSearch
                className='mx-2 cursor-pointer hover:text-green-300 text-2xl'
                onClick={openModal}
              />
            ) : (
              <Link href='/' passHref>
                <FaSearch className='mx-2 cursor-pointer hover:text-green-300 text-2xl' />
              </Link>
            )}
          </div>
        </div>
      </header>

      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75'>
          <div className='bg-white md:w-2/3 p-4 rounded-lg'>
            <div className='flex justify-end'>
              <IoClose
                className='text-2xl hover:text-red-600 cursor-pointer mb-4'
                onClick={closeModal}
              />
            </div>
            <div className='flex flex-col w-full h-full gap-y-4 justify-center items-center'>
              <div className='w-full'>
                <input
                  type='text'
                  placeholder='Buscar...'
                  value={searchTerm}
                  onChange={handleSearch}
                  className='w-full p-2 border rounded'
                  aria-label='Buscar'
                />
              </div>
              <div className='mb-4 w-full space-y-2'>
                <select
                  value={countryFilter}
                  onChange={e => setCountryFilter(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='All'>País</option>
                  <option value='Mexico'>México</option>
                  <option value='Spain'>España</option>
                  <option value='LATAM'>LATAM</option>
                  <option value='USA'>USA</option>
                  <option value='Australia'>Australia</option>
                  <option value='Canada'>Canadá</option>
                  <option value='UK'>Reino Unido</option>
                  <option value='Arabia'>Arabia</option>
                  <option value='Austria'>Austria</option>
                  <option value='Emiratos'>Emiratos</option>
                  <option value='Malasia'>Malasia</option>
                  <option value='Suiza'>Suiza</option>
                </select>
                <select
                  value={difficultyFilter}
                  onChange={e => setDifficultyFilter(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='All'>Dificultad</option>
                  <option value='fácil'>Fácil</option>
                  <option value='medio'>Media</option>
                  <option value='avanzado'>Difícil</option>
                </select>
                <select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='All'>Idioma</option>
                  <option value='Spanish'>Español</option>
                  <option value='English'>Inglés</option>
                </select>

                <select
                  value={starsFilter}
                  onChange={e => setStarsFilter(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
                >
                  <option value='All'>Estrellas</option>
                  <option value='1'>1 estrella</option>
                  <option value='2'>2 estrellas</option>
                  <option value='3'>3 estrellas</option>
                  <option value='4'>4 estrellas</option>
                  <option value='5'>5 estrellas</option>
                </select>
              </div>

              <div className='flex justify-end'>
                <button
                  onClick={handleModalSearch}
                  className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded'
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
