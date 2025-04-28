'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUserLoggedIn = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (res.ok && data.success) {
        setUser({
          ...data.user,
          shoppingList: data.shoppingList || []
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  
  const refreshUser = async () => {
    await checkUserLoggedIn();
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout');

      if (res.ok) {
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const updateFavorites = async (recipeId) => {
    if (!user) return;

    try {
      const res = await fetch('/api/auth/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser({
          ...user,
          favorites: data.favorites
        });
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
    }
  };

  const updateFavoriteCollections = async (collectionId) => {
    if (!user) return;

    try {
      const res = await fetch('/api/auth/favoriteCollections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionId }),
      });


      const data = await res.json();

      if (res.ok && data.success) {
        setUser({
          ...user,
          favoriteCollections: data.favoriteCollections
        });
      }
    } catch (error) {
      console.error('Error al actualizar colecciones favoritas:', error);
    }
  };

 

  const updateShoppingList = async (recipeId, action, count = 1) => {
    if (!user) return;
  
    try {
      const method = action === 'add' ? 'PATCH' : 'DELETE';
  
      let body;
      if (action === 'add') {
        body = { idRecipe: recipeId, count };
      } else {
        body = { idRecipe: recipeId };
      }
  
      const res = await fetch('/api/auth/shoppingList', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
  
      if (res.ok && data.items) {
        setUser({
          ...user,
          shoppingList: data.items
        });
      } else {
        console.error('Respuesta del servidor no válida:', data);
      }
    } catch (error) {
      console.error('Error al actualizar la lista de compras:', error);
    }
  };
  
  const updateRecipeNotes = async (recipeId, noteContent) => {
    if (!user) return;
    
    try {
      const res = await fetch('/api/auth/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId, noteContent }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUser({
          ...user,
          notes: {
            ...user.notes,
            [recipeId]: noteContent
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al actualizar las notas:', error);
      return false;
    }
  };
  
  

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateFavorites,
        updateFavoriteCollections,
        updateShoppingList,
        updateRecipeNotes,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
