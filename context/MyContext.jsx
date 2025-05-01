'use client'
import React, { createContext, useState, useEffect } from 'react'
import { openDB } from 'idb'
import { useAuth } from './AuthContext';

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'




const CalichefContext = createContext()

const MyProvider = ({ children }) => {
  const { user } = useAuth();
  const [AllData, setAllData] = useState(null)
  const [collections, setCollections] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('collections');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCollections, setSearchCollections] = useState('')
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
  const [originalData, setOriginalData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('originalData');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [dataOtherFA, setDataOtherFA] = useState(null)
  const [dataFrance, setDataFrance] = useState(null)
  const [filteredCollections, setFilteredCollections] = useState([])
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingChecked, setShoppingChecked] = useState({});
  const [loadingData, setLoadingData] = useState(true)










































































































  const fetchShoppingList = async () => {
    try {
      const response = await fetch('/api/shopping-list');

      if (response.ok) {
        const data = await response.json();
        setShoppingList(data.items || []);
      }
    } catch (error) {
      console.error('Error al obtener la lista de compras:', error);
    }
  };


  useEffect(() => {



    // Escuchar cambios en user y disparar fetchShoppingList si hay usuario y la lista no está cargada
    if (user && shoppingList.length === 0) {
      fetchShoppingList();
    }
    // No hacer nada si no hay usuario
  }, [user]);

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
            setDataFunc([])
          }
        }











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
          ['dataFrance', '/france.json', setDataFrance],
          ['collections', '/Collection.json', setCollections]
        ].map(([key, url, setter]) => fetchAndCacheData(key, url, setter))




        






        await Promise.all(dataFetches)
        setLoadingData(false)
      } catch (error) {
        console.error('Database error:', error)
        setLoadingData(false)
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
    if (allDataSets.some(data => Array.isArray(data))) {
      const finalData = allDataSets
        .filter(Array.isArray)
        .flat()
        .sort(() => Math.random() - 0.5)
        


      setAllData(finalData)
      setOriginalData(finalData)



    }
  }, [dataMexico, dataSpain, dataLATAM, dataUSA, dataAustralia, dataCanada, dataUK, dataOther, dataOtherFA, dataFrance])


  useEffect(() => {
    if (collections) {
      try {
        // Guardar solo los campos esenciales de cada colección para reducir el tamaño
        const minimalCollections = Array.isArray(collections)
          ? collections.map(({id, title, image_url}) => ({id, title, image_url}))
          : collections;
        sessionStorage.setItem('collections', JSON.stringify(minimalCollections));
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('No se pudo guardar collections en sessionStorage: límite alcanzado.');
        } else {
          console.error('Error guardando collections en sessionStorage:', e);
        }
      }
    }
  }, [collections]);


  useEffect(() => {
    if (originalData) {
      try {
        // Guardar solo los campos esenciales de cada receta para reducir el tamaño
        const minimalOriginalData = Array.isArray(originalData)
          ? originalData.map(({id, title, image_url, category}) => ({id, title, image_url, category}))
          : originalData;
        sessionStorage.setItem('originalData', JSON.stringify(minimalOriginalData));
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('No se pudo guardar originalData en sessionStorage: límite alcanzado.');
        } else {
          console.error('Error guardando originalData en sessionStorage:', e);
        }
      }
    }
  }, [originalData]);

  useEffect(() => {
    setSearchCollections(searchTerm)
  }, [searchTerm])








  return (
    <CalichefContext.Provider
      value={{
        AllData,
        setAllData,
        collections,
        setCollections,
        originalData,
        searchTerm,
        setSearchTerm,
        searchCollections,
        setSearchCollections,
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
        setIngredientFilter,
        filteredCollections,
        setFilteredCollections,
        shoppingList,
        setShoppingList,
        shoppingChecked,
        setShoppingChecked,
        fetchShoppingList,
        loadingData
      }}
    >
      {children}
    </CalichefContext.Provider>
  )
}

export { CalichefContext, MyProvider }