'use client';
import { useState, useEffect, useContext, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';

// Componente de carga reutilizable
const LoadingSpinner = () => (
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
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  </>
);

// Componente de búsqueda
const SearchBar = ({ searchValue, onSearchChange, onSearchClear }) => (
  <form onSubmit={(e) => e.preventDefault()} className="relative mb-8">
    <div className="relative">
      <input
        id="Search"
        className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
        placeholder=" "
        value={searchValue}
        onChange={onSearchChange}
      />
      <label
        htmlFor="Search"
        className="absolute text-md text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
      >
        Search
      </label>
      {searchValue && (
        <button
          onClick={onSearchClear}
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

// Componente principal
export default function Favorites() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchRecipes, setSearchRecipes] = useState('');
  
  const { originalData } = useContext(CalichefContext);

  // Cargar favoritos cuando el usuario esté disponible
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.favorites && originalData) {
      const favorites = originalData.filter(recipe =>
        user.favorites.includes(recipe.id)
      );
      setFavoriteRecipes(favorites);
    }
    
    setLoadingRecipes(false);
  }, [user, loading, router, originalData]);

  // Filtrar recetas usando useMemo para mejorar rendimiento
  const filteredFavorites = useMemo(() => {
    if (!searchRecipes.trim()) return favoriteRecipes;
    
    const searchTerms = searchRecipes.toLowerCase().split(' ').filter(Boolean);
    return favoriteRecipes.filter(recipe =>
      searchTerms.every(term => recipe.title.toLowerCase().includes(term))
    );
  }, [favoriteRecipes, searchRecipes]);

  const handleSearchChange = (event) => {
    setSearchRecipes(event.target.value);
  };

  const clearSearch = () => {
    setSearchRecipes('');
  };

  if (loading || loadingRecipes) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-2 px-4 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6 pt-4">My Favorite Recipes</h1>

        {favoriteRecipes.length > 0 && (
          <SearchBar 
            searchValue={searchRecipes} 
            onSearchChange={handleSearchChange} 
            onSearchClear={clearSearch} 
          />
        )}

        {filteredFavorites.length > 0 ? (
          <>
            <p className="text-white flex justify-end items-center py-2">
              {filteredFavorites.length} collections found
            </p>
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
              {filteredFavorites.map((recipe) => (
                <Card
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  rating_score={recipe.rating_score}
                  rating_count={recipe.rating_count}
                  time={recipe.total_time}
                  img_url={recipe.image_url}
                  category={recipe.category}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-white text-lg mb-4">
              {searchRecipes 
                ? 'No se encontraron recetas con ese término de búsqueda.' 
                : 'No tienes recetas favoritas guardadas.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
            >
              Explorar Recetas
            </button>
          </div>
        )}
      </div>
    </>
  );
}