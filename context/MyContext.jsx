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
      const cachedDataMexico = await db.get(STORE_NAME, 'dataMexico')
      const cachedUserRecipes = await db.get(STORE_NAME, 'userRecipes')
      const cachedDataSpain = await db.get(STORE_NAME, 'dataSpain')
      const cachedDataLATAM = await db.get(STORE_NAME, 'dataLATAM')
      const cachedDataUSA = await db.get(STORE_NAME, 'dataUSA')
      const cachedDataAustralia = await db.get(STORE_NAME, 'dataAustralia')
      const cachedDataCanada = await db.get(STORE_NAME, 'dataCanada')
      const cachedDataOthers = await db.get(STORE_NAME, 'dataOthers')
      const cachedDataUK = await db.get(STORE_NAME, 'dataUK')
      if (cachedUserRecipes) {
        userRecipes === null && (await setUserRecipes(cachedUserRecipes))
      } else {
        db.put(STORE_NAME, [], 'userRecipes')
        setUserRecipes([])
      }

      if (cachedDataMexico) {
        dataMexico === null && (await setDataMexico(cachedDataMexico))
        AllData === null && (await setAllData(cachedDataMexico))
      } else {
        fetch('/mexico.json')
          .then(response => response.json())
          .then(data => {
            setDataMexico(data)
            db.put(STORE_NAME, data, 'dataMexico')
            if (!AllData || AllData.length === 0) {
              setAllData(data)
            }
          })
      }

      if (cachedDataSpain) {
        dataSpain === null && (await setDataSpain(cachedDataSpain))
      } else {
        fetch('/spain.json')
          .then(response => response.json())
          .then(data => {
            setDataSpain(data)
            db.put(STORE_NAME, data, 'dataSpain')
          })
      }

      if (cachedDataLATAM) {
        dataLATAM === null && (await setDataLATAM(cachedDataLATAM))
      } else {
        fetch('/LATAM.json')
          .then(response => response.json())
          .then(data => {
            setDataLATAM(data)
            db.put(STORE_NAME, data, 'dataLATAM')
          })
      }

      if (cachedDataUSA) {
        dataUSA === null && (await setDataUSA(cachedDataUSA))
      } else {
        fetch('/USA.json')
          .then(response => response.json())
          .then(data => {
            setDataUSA(data)
            db.put(STORE_NAME, data, 'dataUSA')
          })
      }

      if (cachedDataAustralia) {
        dataAustralia === null && (await setDataAustralia(cachedDataAustralia))
      } else {
        fetch('/australia.json')
          .then(response => response.json())
          .then(data => {
            setDataAustralia(data)
            db.put(STORE_NAME, data, 'dataAustralia')
          })
      }

      if (cachedDataCanada) {
        dataCanada === null && (await setDataCanada(cachedDataCanada))
      } else {
        fetch('/canada.json')
          .then(response => response.json())
          .then(data => {
            setDataCanada(data)
            db.put(STORE_NAME, data, 'dataCanada')
          })
      }

      if (cachedDataUK) {
        dataUK === null && (await setDataUK(cachedDataUK))
      } else {
        fetch('/UK.json')
          .then(response => response.json())
          .then(data => {
            setDataUK(data)
            db.put(STORE_NAME, data, 'dataUK')
          })
      }

      if (cachedDataOthers) {
        dataOther === null && (await setDataOther(cachedDataOthers))
      } else {
        fetch('/others.json')
          .then(response => response.json())
          .then(data => {
            setDataOther(data)
            db.put(STORE_NAME, data, 'dataOthers')
          })
      }
    }

    // validar si la data está en el cache
    fetchData()
  }, [])

  useEffect(() => {
    if (
      dataMexico &&
      dataSpain &&
      dataLATAM &&
      dataUSA &&
      dataAustralia &&
      dataCanada &&
      dataUK &&
      dataOther
    ) {
      const finalData = [
        ...dataMexico,
        ...dataSpain,
        ...dataLATAM,
        ...dataUSA,
        ...dataAustralia,
        ...dataCanada,
        ...dataUK,
        ...dataOther
      ]
      // ordenar por el rating_count más alto
      finalData.sort((a, b) => b.rating_count - a.rating_count)

      setAllData(finalData)
      setOriginalData(finalData)
    } else if (dataMexico && dataSpain && dataLATAM) {
      const finalData = [...dataMexico, ...dataSpain, ...dataLATAM]
      setAllData(finalData)
      setOriginalData(finalData)
    } else if (dataMexico && (!dataSpain || dataSpain.length === 0)) {
      setAllData(dataMexico)
      setOriginalData(dataMexico)
    } else if (dataSpain && (!dataMexico || dataMexico.length === 0)) {
      setAllData(dataSpain)
      setOriginalData(dataSpain)
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
