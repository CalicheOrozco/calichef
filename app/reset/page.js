'use client';
import { useEffect } from 'react';
import { openDB } from 'idb';

const STORE_NAME = 'recipes';

export default function ResetPage() {
  useEffect(() => {
    // Función para limpiar todos los datos del navegador
    const clearBrowserData = async () => {
      try {
        // Limpiar localStorage
        localStorage.clear();
        
        // Limpiar IndexedDB
        try {
          const DB_NAME = 'calicheDatabase';
          const db = await openDB(DB_NAME, 1);
          const tx = db.transaction(STORE_NAME, 'readwrite');
          await tx.objectStore(STORE_NAME).clear();
          await tx.done;
        } catch (error) {
          console.error('Error al limpiar IndexedDB:', error);
        }
        
        // Limpiar cookies
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
        
        // Mostrar mensaje y redirigir a la página principal
        alert('Todos los datos del navegador han sido limpiados correctamente.');
        window.location.href = '/';
      } catch (error) {
        console.error('Error al limpiar los datos del navegador:', error);
        alert('Ocurrió un error al limpiar los datos. Por favor, intenta de nuevo.');
        window.location.href = '/';
      }
    };
    
    // Ejecutar la limpieza automáticamente al cargar la página
    clearBrowserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Limpiando datos...</h1>
        <p className="mb-4">Estamos limpiando todos los datos almacenados en tu navegador.</p>
        <p>Serás redirigido automáticamente a la página principal.</p>
      </div>
    </div>
  );
}