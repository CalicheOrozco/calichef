'use client';
import { useState, useEffect, useContext, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';

export default function FavoriteCollections() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const { collections } = useContext(CalichefContext) || {};

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Debounce de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Calcular colecciones favoritas
  const favoriteCollections = useMemo(() => {
    if (!user?.favoriteCollections || !collections) return [];
    
    return collections.filter(collection => 
      user.favoriteCollections.includes(collection.id)
    );
  }, [user?.favoriteCollections, collections]);

  // Filtrar colecciones según la búsqueda
  const filteredFavorites = useMemo(() => {
    if (!debouncedSearch.trim()) return favoriteCollections;
    
    const searchTerms = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
    return favoriteCollections.filter(collection =>
      searchTerms.every(term => collection.title.toLowerCase().includes(term))
    );
  }, [favoriteCollections, debouncedSearch]);

  // Manejar cambios en la búsqueda
  const handleSearch = (event) => {
    setSearchInput(event.target.value);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchInput('');
    setDebouncedSearch('');
  };

  if (loading || !collections) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-2 px-4 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6 pt-4">Mis Colecciones Favoritas</h1>

        {favoriteCollections.length > 0 && (
          <SearchBar 
            value={searchInput} 
            onChange={handleSearch} 
            onClear={clearSearch} 
          />
        )}

        {filteredFavorites.length > 0 ? (
          <CollectionGrid collections={filteredFavorites} />
        ) : (
          <EmptyState 
            hasSearch={!!searchInput}
            onExplore={() => router.push('/collections')}
          />
        )}
      </div>
    </>
  );
}

// Componentes auxiliares para mejorar la legibilidad

function LoadingScreen() {
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

function SearchBar({ value, onChange, onClear }) {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="relative mb-8">
      <div className="relative">
        <input
          id="Buscar"
          className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
          placeholder=" "
          value={value}
          onChange={onChange}
        />
        <label
          htmlFor="Buscar"
          className="absolute text-md text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
        >
          Buscar
        </label>
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Borrar búsqueda"
            type="button"
          >
            <IoClose className="text-xl" />
          </button>
        )}
      </div>
    </form>
  );
}

function CollectionGrid({ collections }) {
  return (
    <>
      <p className="text-white flex justify-end items-center py-2">
        {collections.length} colección(es) encontrada(s)
      </p>
      <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
        {collections.map((collection) => (
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
  );
}

function EmptyState({ hasSearch, onExplore }) {
  return (
    <div className="text-center py-10">
      <p className="text-white text-lg mb-4">
        {hasSearch 
          ? 'No se encontraron colecciones con ese término de búsqueda.' 
          : 'No tienes colecciones favoritas guardadas.'}
      </p>
      <button
        onClick={onExplore}
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
      >
        Explorar Colecciones
      </button>
    </div>
  );
}