'use client'
import React, { createContext, useState, useEffect } from 'react'
import { openDB } from 'idb'

const DB_NAME = 'calicheDatabase'
const STORE_NAME = 'dataStore'

// Increased DB version for schema update
const DB_VERSION = 2

const CalichefContext = createContext()

const MyProvider = ({ children }) => {
  const [AllData, setAllData] = useState(null)
  const [collections, setCollections] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [countryFilter, setCountryFilter] = useState(['All'])
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [languageFilter, setLanguageFilter] = useState(['ES'])
  const [starsFilter, setStarsFilter] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState([])
  const [ingredientFilter, setIngredientFilter] = useState([])
  const [countryData, setCountryData] = useState({
    mexico: null,
    spain: null,
    latam: null,
    usa: null,
    australia: null,
    canada: null,
    uk: null,
    other: null,
    otherFA: null,
    france: null
  })
  const [originalData, setOriginalData] = useState(null)
  const [filteredCollections, setFilteredCollections] = useState([])
  const [shoppingList, setShoppingList] = useState([])
  const [shoppingChecked, setShoppingChecked] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Initialize IndexedDB
  const initializeDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }

        // Create a new object store for data references if upgrading from version 1
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('dataRefs')) {
            db.createObjectStore('dataRefs')
          }
        }
      }
    })
  }

  // Function to safely store data in IndexedDB
  const storeInIDB = async (key, data) => {
    try {
      const db = await initializeDB()
      await db.put(STORE_NAME, data, key)
      await db.put(STORE_NAME, Date.now(), `${key}_timestamp`)
      return true
    } catch (error) {
      console.error(`Error storing ${key} in IndexedDB:`, error)
      return false
    }
  }

  // Function to safely store data in sessionStorage with fallback to IDs only
  const safelyStoreInSession = (key, data) => {
    if (!data) return false
    
    try {
      // Try to store minimal data first
      const minimalData = Array.isArray(data) 
        ? data.map(({id, title, image_url, category}) => ({id, title, image_url, category}))
        : data
      sessionStorage.setItem(key, JSON.stringify(minimalData))
      return true
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.warn(`Storage limit reached for ${key}, storing only IDs`)
        try {
          // Fall back to storing only IDs
          const idsOnly = Array.isArray(data) ? data.map(item => item.id) : []
          sessionStorage.setItem(key, JSON.stringify(idsOnly))
          return true
        } catch (innerError) {
          console.error(`Failed to store even minimal data for ${key}:`, innerError)
          return false
        }
      } else {
        console.error(`Error storing ${key}:`, e)
        return false
      }
    }
  }

  // Improved fetch and cache function with timestamp checks
  const fetchAndCacheData = async (key, url, setter) => {
    try {
      const db = await initializeDB()
      
      // Check IndexedDB first
      const cachedData = await db.get(STORE_NAME, key)
      const cacheTimestamp = await db.get(STORE_NAME, `${key}_timestamp`)
      
      // Cache is fresh if less than 24 hours old
      const isCacheFresh = cacheTimestamp && (Date.now() - cacheTimestamp < 24 * 60 * 60 * 1000)
      
      if (cachedData && isCacheFresh) {
        setter(cachedData)
        return
      }
      
      // If cache is stale or doesn't exist, fetch fresh data
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      
      // Update state
      setter(data)
      
      // Update cache with new data and timestamp
      await db.put(STORE_NAME, data, key)
      await db.put(STORE_NAME, Date.now(), `${key}_timestamp`)
    } catch (error) {
      console.error(`Error fetching ${key}:`, error)
      // If fetch fails but we have cached data (even if stale), use it
      const db = await initializeDB()
      const cachedData = await db.get(STORE_NAME, key)
      if (cachedData) {
        setter(cachedData)
      } else {
        setter([])
      }
    }
  }

  const fetchShoppingList = async () => {
    try {
      const response = await fetch('/api/shopping-list')
      
      if (response.ok) {
        const data = await response.json()
        setShoppingList(data.items || [])
      }
    } catch (error) {
      console.error('Error al obtener la lista de compras:', error)
    }
  }

  // Load shopping list on mount
  useEffect(() => {
    fetchShoppingList()
  }, [])

  // Initialize data from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedCollections = sessionStorage.getItem('collections')
        if (storedCollections) {
          setCollections(JSON.parse(storedCollections))
        }
        
        const storedOriginalData = sessionStorage.getItem('originalData')
        if (storedOriginalData) {
          setOriginalData(JSON.parse(storedOriginalData))
        }
      } catch (error) {
        console.error('Error loading data from sessionStorage:', error)
      }
    }
  }, [])

  // Fetch all data sources
  useEffect(() => {
    async function fetchData() {
      try {
        const countryUrls = [
          ['mexico', '/mexico.json'],
          ['spain', '/spain.json'],
          ['latam', '/LATAM.json'],
          ['usa', '/USA.json'],
          ['australia', '/australia.json'],
          ['canada', '/canada.json'],
          ['uk', '/UK.json'],
          ['other', '/others.json'],
          ['otherFA', '/othersFA.json'],
          ['france', '/france.json']
        ]

        // Fetch and set each country's data
        for (const [country, url] of countryUrls) {
          fetchAndCacheData(country, url, (data) => {
            setCountryData(prev => ({ ...prev, [country]: data }))
          })
        }

        // Fetch collections separately
        fetchAndCacheData('collections', '/Collection.json', setCollections)
      } catch (error) {
        console.error('Database error:', error)
      }
    }

    fetchData()
  }, [])

  // Combine all country data into AllData when any country data changes
  useEffect(() => {
    const dataValues = Object.values(countryData)
    
    // Check if we have at least some data to work with
    if (dataValues.some(data => Array.isArray(data))) {
      const finalData = dataValues
        .filter(Array.isArray)
        .flat()
        // Remove random sort to improve performance
        // Only sort if needed for initial display
      
      setAllData(finalData)
      setOriginalData(finalData)
      
      // Cache the combined data in IndexedDB
      storeInIDB('allData', finalData)
    }
  }, [countryData])

  // Save collections to sessionStorage when they change
  useEffect(() => {
    if (collections) {
      safelyStoreInSession('collections', collections)
    }
  }, [collections])

  // Save originalData to sessionStorage when it changes
  useEffect(() => {
    if (originalData) {
      safelyStoreInSession('originalData', originalData)
      
      // Also store the full data in IndexedDB as backup
      storeInIDB('originalData', originalData)
    }
  }, [originalData])

  // Get paginated data for display
  const getDisplayedData = () => {
    if (!originalData) return []
    return originalData.slice(
      (currentPage - 1) * itemsPerPage, 
      currentPage * itemsPerPage
    )
  }

  return (
    <CalichefContext.Provider
      value={{
        AllData,
        setAllData,
        collections,
        setCollections,
        originalData,
        setOriginalData,
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
        setIngredientFilter,
        filteredCollections,
        setFilteredCollections,
        shoppingList,
        setShoppingList,
        shoppingChecked,
        setShoppingChecked,
        fetchShoppingList,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        getDisplayedData
      }}
    >
      {children}
    </CalichefContext.Provider>
  )
}

export { CalichefContext, MyProvider }