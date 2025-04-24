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
          console.error('Error cleaning IndexedDB', error);
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
        alert('All browser data has been successfully cleared.');
        window.location.href = '/';
      } catch (error) {
        console.error('Error clearing browser data:', error);
        alert('An error occurred while clearing the data. Please try again.');
        window.location.href = '/';
      }
    };
    
    // Ejecutar la limpieza automáticamente al cargar la página
    clearBrowserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">cleaning data...</h1>
        <p className="mb-4">We are clearing all data stored in your browser.</p>
        <p>You will be automatically redirected to the home page.</p>
      </div>
    </div>
  );
}