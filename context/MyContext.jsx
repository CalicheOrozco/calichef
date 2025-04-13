'use client'
import React, { createContext, useState, useEffect } from 'react'
import { openDB } from 'idb'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

const CalichefContext = createContext()

const MyProvider = ({ children }) => {
  const [AllData, setAllData] = useState(null)
  const [userRecipes, setUserRecipes] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState(['All'])
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [languageFilter, setLanguageFilter] = useState(['ES'])
  const [starsFilter, setStarsFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState([])
  const [ingredientFilter, setIngredientFilter] = useState([])

  const [dataMexico, setDataMexico] = useState(null)
  const [dataSpain, setDataSpain] = useState(null)
  const [dataLATAM, setDataLATAM] = useState(null)
  const [dataUSA, setDataUSA] = useState(null)
  const [dataAustralia, setDataAustralia] = useState(null)
  const [dataCanada, setDataCanada] = useState(null)
  const [dataUK, setDataUK] = useState(null)
  const [dataOther, setDataOther] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [dataOtherFA, setDataOtherFA] = useState(null)
  const [dataFrance, setDataFrance] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const db = await openDB(DB_NAME, 1, {
          upgrade(db) {
            db.createObjectStore(STORE_NAME)
          }
        })

        const fetchAndCacheData = async (key, url, setDataFunc) => {
          try {
            const cachedData = await db.get(STORE_NAME, key)
            if (cachedData) {
              setDataFunc(cachedData)
              return
            }
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            const data = await response.json()
            setDataFunc(data)
            await db.put(STORE_NAME, data, key)
          } catch (error) {
            console.error(`Error fetching ${key}:`, error)
            setDataFunc([]) // Set empty array instead of null on error
          }
        }

        // Fetch all data in parallel
        const dataFetches = [
          ['dataMexico', '/mexico.json', setDataMexico],
          ['dataSpain', '/spain.json', setDataSpain],
          ['dataLATAM', '/LATAM.json', setDataLATAM],
          ['dataUSA', '/USA.json', setDataUSA],
          ['dataAustralia', '/australia.json', setDataAustralia],
          ['dataCanada', '/canada.json', setDataCanada],
          ['dataUK', '/UK.json', setDataUK],
          ['dataOthers', '/others.json', setDataOther],
          ['dataOtherFA', '/othersFA.json', setDataOtherFA],
          ['dataFrance', '/france.json', setDataFrance]
        ].map(([key, url, setter]) => fetchAndCacheData(key, url, setter))

        // Handle user recipes separately to avoid blocking other data
        const cachedUserRecipes = await db.get(STORE_NAME, 'userRecipes')
        setUserRecipes(cachedUserRecipes || [])
        if (!cachedUserRecipes) {
          await db.put(STORE_NAME, [], 'userRecipes')
        }

        // Wait for all fetches to complete
        await Promise.all(dataFetches)
      } catch (error) {
        console.error('Database error:', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const allDataSets = [
      dataMexico,
      dataSpain,
      dataLATAM,
      dataUSA,
      dataAustralia,
      dataCanada,
      dataUK,
      dataOther,
      dataOtherFA,
      dataFrance
    ]

    // Only update if we have at least one non-null dataset
    if (allDataSets.some(data => Array.isArray(data))) {
      const finalData = allDataSets
        .filter(Array.isArray)
        .flat()
        .sort(() => Math.random() - 0.5)
      
      setAllData(finalData)
      setOriginalData(finalData)
    }
  }, [dataMexico, dataSpain, dataLATAM, dataUSA, dataAustralia, dataCanada, dataUK, dataOther, dataOtherFA, dataFrance])

  return (
    <CalichefContext.Provider
      value={{
        AllData,
        setAllData,
        userRecipes,
        setUserRecipes,
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
      }}
    >
      {children}
    </CalichefContext.Provider>
  )
}

export { CalichefContext, MyProvider }
