'use client';
import { useState, useEffect, useContext } from 'react';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';


export default function Collections() {
  const [searchCollections, setSearchCollections] = useState('');
  const [loadingCollections, setLoadingCollections] = useState(true);
  const contextValue = useContext(CalichefContext);
  const { filteredCollections } = contextValue || {};
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchCollections);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchCollections]);

  useEffect(() => {
    if (filteredCollections) {
      setLoadingCollections(false);
    }
  }, [filteredCollections]);

  const handleSearch = (event) => {
    setSearchCollections(event.target.value);
  };

  const searchTermsArray = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
  const filteredBySearch = filteredCollections ? filteredCollections.filter(collection =>
    searchTermsArray.every(term =>
      collection.title.toLowerCase().includes(term)
    )
  ) : [];

  if (loadingCollections) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-20 px-4 min-h-screen flex justify-center items-center">
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
      <div className="container mx-auto py-20 px-4 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6 pt-4">Colecciones</h1>
        {filteredCollections && filteredCollections.length > 0 && (
          <form onSubmit={(e) => e.preventDefault()} className="relative mb-8">
            <input
              id="Buscar"
              className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
              placeholder=" "
              value={searchCollections}
              onChange={handleSearch}
            />
            <label
              htmlFor="Buscar"
              className="absolute text-md text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
            >
              Buscar
            </label>
          </form>
        )}
        {filteredBySearch && filteredBySearch.length > 0 ? (
          <>
            <p className="text-white flex justify-end items-center py-2">
              {filteredBySearch.length} colección(es) encontrada(s)
            </p>
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
              {filteredBySearch.map((collection) => (
                <Card
                  key={collection.id}
                  id={`${collection.id}`}
                  title={collection.title}
                  img_url={collection.image_url}
                  isCollection={true}
                />
              ))}
            </div>
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