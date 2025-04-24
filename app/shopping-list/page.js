/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import React, { useContext, useMemo } from 'react';
import ShoppingList from '@/components/ShoppingList';
import Navbar from '@/components/Navbar';
import { CalichefContext } from '@/context/MyContext';

// Componente separado que extrae el contexto
function ShoppingListContainer() {
  const contextValue = useContext(CalichefContext);
  
  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente ShoppingListPage');
    return null;
  }
  
  // Usar useMemo para mantener la referencia estable de la lista
  const { shoppingList = [] } = contextValue;
  const memoizedList = useMemo(() => shoppingList, [shoppingList]);
  
  const isLoading = !shoppingList;
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (memoizedList.length === 0) {
    return <EmptyState />;
  }
  
  return <ShoppingList list={memoizedList} />;
}

// El componente principal se mantiene simple
export default function ShoppingListPage() {
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-2 px-4 min-h-screen">
        <h1 className="text-2xl font-bold text-white my-6">Shopping list</h1>
        <ShoppingListContainer />
      </div>
    </>
  );
}

// Componentes separados para mejor legibilidad
const LoadingSpinner = React.memo(function LoadingSpinner() {
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
      <p className="mt-4 text-lg text-gray-600">Loading...</p>
    </div>
  );
});

const EmptyState = React.memo(function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-white text-lg">There are no recipes on your shopping list.</p>
    </div>
  );
});