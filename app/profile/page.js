'use client';
import { useState, useEffect, useContext } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import { CalichefContext } from '@/context/MyContext';
import { openDB } from 'idb';

const DB_NAME = 'calicheDatabase';
const STORE_NAME = 'dataStore';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [searchRecipies, setSearchRecipies] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const contextValue = useContext(CalichefContext);
  const { originalData } = contextValue || {};

  // Debounce effect (espera 400ms después de que el usuario deja de escribir)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchRecipies);
    }, 400); // Puedes ajustar este tiempo

    return () => clearTimeout(handler);
  }, [searchRecipies]);

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
      setLoadingFavorites(false);
    } else if (!loading && user) {
      setLoadingFavorites(false);
    }
  }, [user, loading, originalData, router]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = event => {
    setSearchRecipies(event.target.value);
  };

  // Búsqueda con debounce aplicado
  const searchTermsArray = debouncedSearch.toLowerCase().split(' ').filter(Boolean);
  const filteredFavorites = favoriteRecipes.filter(recipe =>
    searchTermsArray.every(term =>
      recipe.title.toLowerCase().includes(term)
    )
  );

  if (loading || !user) {
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
        <div className="max-w-4xl mx-auto bg-black text-white p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl text-white font-bold">Mi Perfil</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h2 className="text-xl text-white font-semibold mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-300">Nombre:</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-gray-300">Correo Electrónico:</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro que deseas limpiar los datos almacenados en el navegador? Esto no afectará tus datos guardados en la base de datos.')) {
                    // Limpiar localStorage
                    localStorage.clear();
                    
                    // Limpiar IndexedDB
                    const clearIndexedDB = async () => {
                      try {
                        const DB_NAME = 'calicheDatabase';
                        const db = await openDB(DB_NAME, 1);
                        const tx = db.transaction(STORE_NAME, 'readwrite');
                        await tx.objectStore(STORE_NAME).clear();
                        await tx.done;
                        alert('Datos del navegador limpiados correctamente. La página se recargará para aplicar los cambios.');
                        window.location.reload();
                      } catch (error) {
                        console.error('Error al limpiar IndexedDB:', error);
                        alert('Ocurrió un error al limpiar los datos. Por favor, intenta de nuevo.');
                      }
                    };
                    
                    clearIndexedDB();
                  }
                }}
                className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 transition duration-200"
              >
                Limpiar Datos del Navegador
              </button>
            </div>
          </div>

          <div className="mb-6">
            <form onSubmit={e => e.preventDefault()} className="relative mt-4">
              <input
                id="Buscar"
                className="block rounded-md px-6 pt-6 pb-1 w-full text-md text-white bg-neutral-700 appearance-none focus:outline-none focus:ring-0 peer"
                placeholder=" "
                value={searchRecipies}
                onChange={handleSearch}
              />
              <label
                htmlFor="Buscar"
                className="absolute text-md text-zinc-400 duration-150 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-5 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
              >
                Buscar
              </label>
            </form>

            <h2 className="text-xl text-white font-semibold mb-4 pt-4">
              Mis Recetas Favoritas
            </h2>

            {loadingFavorites ? (
              <p className="text-gray-300">Cargando favoritos...</p>
            ) : filteredFavorites && filteredFavorites.length > 0 ? (
              <>
                <p className="text-white flex justify-end items-center py-2">
                  {filteredFavorites.length} receta(s) encontrada(s)
                </p>
                <div className="flex flex-wrap justify-center md:justify-between items-center gap-y-5">
                  {filteredFavorites.map(recipe => (
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
              <p className="text-gray-300">No se encontraron recetas favoritas con ese nombre.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
