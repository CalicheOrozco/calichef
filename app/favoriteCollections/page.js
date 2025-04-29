'use client';
import { useState, useEffect, useContext, useMemo, useRef, useCallback } from 'react';
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
  const [highlightedCollectionId, setHighlightedCollectionId] = useState(null);
  const containerRef = useRef(null);
  
  const { collections } = useContext(CalichefContext);

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
  
  // Guardar posición de scroll antes de navegar a una colección
  useEffect(() => {
    const handleLinkClick = (e) => {
      if (e.target.closest('a[href^="/collections/"]')) {
        localStorage.setItem('favoriteCollectionsScroll', window.scrollY.toString());
        
        // Encontrar el índice de la colección seleccionada
        const card = e.target.closest('.card-item');
        if (card && card.dataset.id) {
          const collectionId = card.dataset.id;
          const index = favoriteCollections.findIndex(c => c.id === collectionId);
          if (index !== -1) {
            localStorage.setItem('lastFavoriteCollectionIndex', index.toString());
          }
        }
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, [favoriteCollections]);
  
  // Restaurar posición de scroll y destacar colección seleccionada al volver
  useEffect(() => {
    if (loading || !favoriteCollections.length) return;
    
    // Verificar si hay un índice de colección guardado
    const lastCollectionIndex = localStorage.getItem('lastFavoriteCollectionIndex');
    
    if (lastCollectionIndex !== null) {
      const index = parseInt(lastCollectionIndex, 10);
      if (!isNaN(index) && index >= 0 && index < favoriteCollections.length) {
        // Destacar la colección seleccionada
        setHighlightedCollectionId(favoriteCollections[index].id);
        
        // Restaurar la posición de scroll
        const scrollPosition = localStorage.getItem('favoriteCollectionsScroll');
        if (scrollPosition) {
          window.scrollTo(0, parseInt(scrollPosition, 10));
        }
        
        // Eliminar los datos guardados después de usarlos
        localStorage.removeItem('lastFavoriteCollectionIndex');
        localStorage.removeItem('favoriteCollectionsScroll');
        
        // Quitar el destacado después de un tiempo
        setTimeout(() => {
          setHighlightedCollectionId(null);
        }, 2000);
      }
    }
  }, [loading, favoriteCollections]);
  
  // Función para manejar el clic en una tarjeta
  const handleCardClick = useCallback((collection, index) => {
    // Esta función se llamará desde el componente CollectionGrid
    localStorage.setItem('favoriteCollectionsScroll', window.scrollY.toString());
    localStorage.setItem('lastFavoriteCollectionIndex', index.toString());
  }, []);

  if (loading || !collections) {
    return <LoadingScreen />;
  }

  // Estilos para la tarjeta destacada
  const highlightedCardStyle = `
    @keyframes pulseHighlight {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .highlighted-card {
      border: 2px solid #22c55e !important;
      animation: pulseHighlight 2s infinite;
      transform: scale(1.03);
      transition: all 0.3s ease;
      z-index: 10;
    }
  `;

  return (
    <>
      <style jsx global>{highlightedCardStyle}</style>
      <Navbar />
      <div className="container mx-auto py-2 px-4 min-h-screen" ref={containerRef}>
        <h1 className="text-2xl font-bold text-white mb-6 pt-4">My Favorite Collections</h1>

        {favoriteCollections.length > 0 && (
          <SearchBar 
            value={searchInput} 
            onChange={handleSearch} 
            onClear={clearSearch} 
          />
        )}

        {filteredFavorites.length > 0 ? (
          <CollectionGrid 
            collections={filteredFavorites} 
            onCardClick={handleCardClick}
            highlightedId={highlightedCollectionId}
          />
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
          <p className="mt-4 text-lg text-gray-600">loading...</p>
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
          id="Search"
          className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
          placeholder=" "
          value={value}
          onChange={onChange}
        />
        <label
          htmlFor="Search"
          className="absolute text-md text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
        >
          Search
        </label>
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label="Clear search"
            type="button"
          >
            <IoClose className="text-xl" />
          </button>
        )}
      </div>
    </form>
  );
}

function CollectionGrid({ collections, onCardClick, highlightedId }) {
  return (
    <>
      <p className="text-white flex justify-end items-center py-2">
        {collections.length} collections found
      </p>
      <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
        {collections.map((collection, index) => (
          <div 
            key={collection.id}
            onClick={() => onCardClick(collection, index)}
            className={`card-item transition-all duration-500 ${highlightedId === collection.id ? 'ring-4 ring-green-500 scale-105 z-10' : ''}`}
            data-id={collection.id}
          >
            <Card
              id={`${collection.id}`}
              title={collection.title}
              img_url={collection.image_url}
              isCollection={true}
            />
          </div>
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
          ? 'No collections were found with that search term.' 
          : 'You have no saved favorite collections.'}
      </p>
      <button
        onClick={onExplore}
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
      >
        Explore Collections
      </button>
    </div>
  );
}