'use client';
import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';

export default function Collections() {
  const [searchCollections, setSearchCollections] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const containerRef = useRef(null);
  
  const { filteredCollections = [] } = useContext(CalichefContext);
  const isLoading = !filteredCollections.length;

  // Filter collections based on search terms
  const searchCollectionssArray = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
  const filteredBySearch = searchCollectionssArray.length > 0
    ? filteredCollections.filter(collection =>
        searchCollectionssArray.every(term =>
          collection.title.toLowerCase().includes(term)
        )
      )
    : filteredCollections;

  // Handle debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchCollections);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchCollections]);

  // Create memoized scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && visibleCount < filteredBySearch.length) {
      setVisibleCount(prev => Math.min(prev + 50, filteredBySearch.length));
    }
  }, [visibleCount, filteredBySearch.length]);

  // Set up infinite scroll
  useEffect(() => {
    const currentRef = containerRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(50);
  }, [debouncedSearch]);

  const visibleCollections = filteredBySearch.slice(0, visibleCount);

  const handleSearchChange = (event) => {
    setSearchCollections(event.target.value);
  };

  const clearSearch = () => {
    setSearchCollections('');
    setDebouncedSearch('');
    setVisibleCount(50);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-2 px-4 min-h-screen flex justify-center items-center">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-gray-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-lg text-gray-600">Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div 
        ref={containerRef} 
        className="container mx-auto py-2 px-4 min-h-screen overflow-y-auto scrollbar-hidden" 
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        <h1 className="text-2xl font-bold text-white mb-6 pt-4">Collections</h1>
        
        {filteredCollections.length > 0 && (
          <form onSubmit={(e) => e.preventDefault()} className="relative mb-8">
            <div className="relative">
              <input
                id="Search"
                className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
                placeholder=" "
                value={searchCollections}
                onChange={handleSearchChange}
              />
              <label
                htmlFor="Search"
                className="absolute text-md text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Search
              </label>
              
              {searchCollections && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label="Borrar búsqueda"
                  type="button"
                >
                  <IoClose className="text-xl" />
                </button>
              )}
            </div>
          </form>
        )}
        
        {filteredBySearch.length > 0 ? (
          <>
            <p className="text-white flex justify-end items-center py-2">
              {filteredBySearch.length} collections found
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
              {visibleCollections.map((collection) => (
                <Card
                  key={collection.id}
                  id={`${collection.id}`}
                  title={collection.title}
                  img_url={collection.image_url}
                  isCollection={true}
                />
              ))}
            </div>
            
            {visibleCount < filteredBySearch.length && (
              <div className="flex justify-center py-6">
                <span className="text-gray-400">Cargando más colecciones...</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-white text-lg mb-4">
              {searchCollections ? 'No se encontraron colecciones con ese término de búsqueda.' : 'No hay colecciones disponibles.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}