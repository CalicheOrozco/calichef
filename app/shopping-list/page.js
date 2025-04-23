"use client";
import React, { useContext } from 'react';
import ShoppingList from '@/components/ShoppingList';
import Navbar from '@/components/Navbar';
import { CalichefContext } from '@/context/MyContext';

export default function ShoppingListPage() {
  const contextValue = useContext(CalichefContext);
  
  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente ShoppingListPage');
    return null; // Evita renderizar el componente con contexto inválido
  }
  
  const { shoppingList = [] } = contextValue;
  const isLoading = !shoppingList;

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-2 px-4 min-h-screen">
        <h1 className="text-2xl font-bold text-white my-6">Lista de Compras</h1>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : shoppingList.length > 0 ? (
          <ShoppingList list={shoppingList} />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

// Componentes separados para mejor legibilidad
function LoadingSpinner() {
  return (
    <div className="text-center py-20">
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
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-white text-lg">No hay recetas en tu lista de compras.</p>
    </div>
  );
}