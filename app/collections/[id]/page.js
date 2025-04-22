'use client';
import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { FaArrowLeft } from "react-icons/fa6";

export default function CollectionDetail({ params }) {
  const router = useRouter();
  const [collection, setCollection] = useState(null);
  const [collectionRecipes, setCollectionRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchRecipes, setSearchRecipes] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const contextValue = useContext(CalichefContext);
  const { collections, originalData } = contextValue || {};
  const { user, updateFavoriteCollections, isAuthenticated } = useAuth();

  // Debounce de búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchRecipes);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchRecipes]);

  useEffect(() => {
    if (!collections || !originalData) return;
    // Buscar la colección por ID
    const currentCollection = collections.find(c => c.id === params.id);
    if (!currentCollection) {
      setCollection(null);
      setCollectionRecipes([]);
      setLoading(false);
      return;
    }
    setCollection(currentCollection);
    // Filtrar las recetas que pertenecen a esta colección
    if (currentCollection.recipes && Array.isArray(currentCollection.recipes)) {
      // Optimización: usar un Set para búsquedas más rápidas
      const recipeIdsSet = new Set(currentCollection.recipes);
      const recipesInCollection = originalData.filter(recipe => 
        recipeIdsSet.has(recipe.id)
      );
      setCollectionRecipes(recipesInCollection);
    } else {
      setCollectionRecipes([]);
    }
    // Verificar si la colección está en favoritos del usuario
    if (user && user.favoriteCollections) {
      setIsFavorite(user.favoriteCollections.includes(currentCollection.id));
    } else {
      setIsFavorite(false);
    }
    setLoading(false);
  }, [collections, originalData, params.id, user]);

  const handleSearch = (event) => {
    setSearchRecipes(event.target.value);
  };

  const searchTermsArray = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
  const filteredRecipes = collectionRecipes.filter(recipe =>
    searchTermsArray.every(term =>
      recipe.title.toLowerCase().includes(term) 
      
    )
  );

  

  if (loading) {
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

  if (!collection) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-2 px-4 min-h-screen">
          <div className="text-center py-10">
            <p className="text-white text-lg mb-4">Colección no encontrada</p>
            {/* volver a la pagina */}
            <a
            onClick={(e) => {
              e.preventDefault()
              router.back()
            }}
            className="text-white text-xl hover:text-gray-400 mb-4 flex items-center pt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-2 px-4 min-h-screen">
        <div className="mb-6">
        <div
          className="text-white text-4xl  md:py-4 lg:pl-4 hover:text-gray-400 flex items-center cursor-pointer"
        >
          <FaArrowLeft onClick={(e) => {
            e.preventDefault()
            router.back()
          }}
          className="mr-2" />
          
        </div>

          <div className="flex justify-center items-center flex-col md:flex-row gap-6 items-start mb-8">
            {collection.image_url && (
              <div>
                <Image
                  src={collection.image_url}
                  alt={collection.title}
                  width={250}
                  height={250}
                  className="rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="w-full md:w-2/3">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-4">{collection.title}</h1>
                  {collection.description && (
                    <p className="text-gray-300 mb-4">{collection.description}</p>
                  )}
                  <p className="text-gray-400">{filteredRecipes.length} recipes</p>
                </div>
                {isAuthenticated && (
                  <div className="text-4xl cursor-pointer">
                    {isFavorite ? (
                      <FaHeart
                        onClick={() => {
                          updateFavoriteCollections(collection.id);
                          setIsFavorite(!isFavorite);
                        }}
                        className="text-red-500 hover:text-red-700"
                      />
                    ) : (
                      <FaRegHeart
                        onClick={() => {
                          updateFavoriteCollections(collection.id);
                          setIsFavorite(!isFavorite);
                        }}
                        className="text-white hover:text-gray-500"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {collectionRecipes.length > 0 && (
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
                Buscar recetas en esta colección
              </label>
            </form>
          )}

          {filteredRecipes.length > 0 ? (
            <>
              <p className="text-white flex justify-end items-center py-2">
                {filteredRecipes.length} receta(s) encontrada(s)
              </p>
              <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
                {filteredRecipes.map((recipe) => (
                  <Card
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    rating_score={recipe.rating_score || 0}
                    rating_count={recipe.rating_count || 0}
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
                  : 'No hay recetas en esta colección.'}
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
      </div>
    </>
  );
}