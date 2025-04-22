'use client';
import { useState, useEffect, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';

export default function Favorites() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchRecipes, setSearchRecipes] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const contextValue = useContext(CalichefContext);
  const { originalData } = contextValue || {};

  // Debounce de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchRecipes);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchRecipes]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.favorites && originalData) {
      const favorites = originalData.filter(recipe =>
        user.favorites.includes(recipe.id)
      );
      setFavoriteRecipes(favorites);
      setLoadingRecipes(false);
    } else if (!loading && user) {
      setLoadingRecipes(false);
    }
  }, [user, loading, router, originalData]);

  const handleSearch = (event) => {
    setSearchRecipes(event.target.value);
  };

  const searchTermsArray = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
  const filteredFavorites = favoriteRecipes.filter(recipe =>
    searchTermsArray.every(term =>
      recipe.title.toLowerCase().includes(term)
    )
  );

  if (loading || loadingRecipes) {
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
      <div className="container mx-auto py-2 px-4 min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6 pt-4">Mis Recetas Favoritas</h1>

        {favoriteRecipes.length > 0 && (
          <form onSubmit={(e) => e.preventDefault()} className="relative mb-8">
            <input
              id="Buscar"
              className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
              placeholder=" "
              value={searchRecipes}
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

        {filteredFavorites.length > 0 ? (
          <>
            <p className="text-white flex justify-end items-center py-2">
              {filteredFavorites.length} receta(s) encontrada(s)
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
              {searchRecipes ? 'No se encontraron recetas con ese término de búsqueda.' : 'No tienes recetas favoritas guardadas.'}
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
