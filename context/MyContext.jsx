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
  const [countryFilter, setCountryFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [languageFilter, setLanguageFilter] = useState('All')
  const [starsFilter, setStarsFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [dataMexico, setDataMexico] = useState(null)
  const [dataSpain, setDataSpain] = useState(null)
  const [dataLATAM, setDataLATAM] = useState(null)
  const [dataUSA, setDataUSA] = useState(null)
  const [dataAustralia, setDataAustralia] = useState(null)
  const [dataCanada, setDataCanada] = useState(null)
  const [dataUK, setDataUK] = useState(null)
  const [dataOther, setDataOther] = useState(null)
  const [originalData, setOriginalData] = useState(null)

  useEffect(() => {
    async function fetchData () {
      const db = await openDB(DB_NAME, 1, {
        upgrade (db) {
          db.createObjectStore(STORE_NAME)
        }
      })

      const fetchAndCacheData = async (key, url, setDataFunc) => {
        const cachedData = await db.get(STORE_NAME, key)
        if (cachedData) {
          setDataFunc(cachedData)
        } else {
          const response = await fetch(url)
          const data = await response.json()
          setDataFunc(data)
          db.put(STORE_NAME, data, key)
        }
      }

      await fetchAndCacheData('dataMexico', '/mexico.json', setDataMexico)
      await fetchAndCacheData('dataSpain', '/spain.json', setDataSpain)
      await fetchAndCacheData('dataLATAM', '/LATAM.json', setDataLATAM)
      await fetchAndCacheData('dataUSA', '/USA.json', setDataUSA)
      await fetchAndCacheData(
        'dataAustralia',
        '/australia.json',
        setDataAustralia
      )
      await fetchAndCacheData('dataCanada', '/canada.json', setDataCanada)
      await fetchAndCacheData('dataUK', '/UK.json', setDataUK)
      await fetchAndCacheData('dataOthers', '/others.json', setDataOther)

      const cachedUserRecipes = await db.get(STORE_NAME, 'userRecipes')
      setUserRecipes(cachedUserRecipes || [])
      if (!cachedUserRecipes) {
        db.put(STORE_NAME, [], 'userRecipes')
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
      dataOther
    ].filter(data => data)

    if (allDataSets.length > 0) {
      const finalData = allDataSets.flat()
      finalData.sort((a, b) => b.rating_count - a.rating_count)
      setAllData(finalData)
      setOriginalData(finalData)
    }
  }, [
    dataMexico,
    dataSpain,
    dataLATAM,
    dataUSA,
    dataAustralia,
    dataCanada,
    dataUK,
    dataOther
  ])

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
        setIsModalOpen
      }}
    >
      {children}
    </CalichefContext.Provider>
  )
}

export { CalichefContext, MyProvider }
