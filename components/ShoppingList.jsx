import React, { useContext, useState, useRef, useEffect } from 'react';
import { CalichefContext } from '../context/MyContext';
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image';
import { FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';

export default function ShoppingList({ list }) {
  const contextValue = useContext(CalichefContext);
  const { originalData, setShoppingList, fetchShoppingList } = contextValue || {};
  const { updateShoppingList } = useAuth();

  const [menuOpen, setMenuOpen] = useState({});
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const menuRefs = useRef({});

  useEffect(() => {
    function handleClickOutside(event) {
      const openIds = Object.keys(menuOpen).filter(id => menuOpen[id]);
      let clickedOutside = false;
      for (const id of openIds) {
        if (menuRefs.current[id] && !menuRefs.current[id].contains(event.target)) {
          clickedOutside = true;
        } else {
          clickedOutside = false;
          break;
        }
      }
      if (clickedOutside && openIds.length > 0) {
        setMenuOpen({});
      }
    }
    if (Object.values(menuOpen).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);
  // Nuevo: Extraer idlist y countMap desde el array de objetos
  const idlist = list?.map(item => item.idRecipe) || [];
  const countMap = list?.reduce((acc, item) => {
    acc[item.idRecipe] = item.count;
    return acc;
  }, {}) || {};

  // Filtrar recetas por los ids en idlist
  const recipes = originalData && idlist.length
    ? originalData.filter(recipe => idlist.includes(recipe.id))
    : [];

  const toggleMenu = (id) => {
    setMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const removeFromShoppingList = async (idRecipe) => {
    await updateShoppingList(idRecipe, 'delete');
    setShoppingList(prevList => prevList.filter(item => item.idRecipe !== idRecipe));
    await fetchShoppingList();
  };

  const handlePlusOne = async (idRecipe) => {
    await updateShoppingList(idRecipe, 'add', 1);
    await fetchShoppingList();
  };
  const handleMinusOne = async (idRecipe) => {
    await updateShoppingList(idRecipe, 'add', -1);
    await fetchShoppingList();
  }
  const [viewMode, setViewMode] = useState('recipe'); // 'recipe' o 'category'

  return (
    <div className="bg-neutral-900 rounded-lg shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded ${viewMode==='recipe'?'bg-green-700 text-white':'bg-neutral-800 text-neutral-300'}`} onClick={()=>setViewMode('recipe')}>Por recetas</button>
        <button className={`px-4 py-2 rounded ${viewMode==='category'?'bg-green-700 text-white':'bg-neutral-800 text-neutral-300'}`} onClick={()=>setViewMode('category')}>Por categoría</button>
      </div>
      {recipes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-white text-lg">No hay ingredientes para mostrar.</p>
        </div>
      ) : (
        viewMode === 'recipe' ? (
          <div className="space-y-10">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-neutral-800 rounded-xl p-5 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                <Link href={`/${recipe.id}`} passHref>
                  <Image src={recipe.image_url} alt={recipe.title} width={70} height={70} className="rounded-lg object-cover border border-neutral-700" />
                </Link>
                  <Link href={`/${recipe.id}`} passHref>
                    <span className="text-white text-xl font-bold tracking-tight">{recipe.title}</span>
                  </Link>

                  <div className="relative text-white ml-auto cursor-pointer" onClick={() => toggleMenu(recipe.id)} ref={el => (menuRefs.current[recipe.id] = el)}>
                    <FaEllipsisV />
                    {menuOpen[recipe.id] && (
                      <div className="absolute bg-neutral-800 rounded-lg shadow-lg mt-2 right-0 w-64 z-10">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-2 p-3 hover:bg-gray-500 text-white cursor-pointer" onClick={() => handlePlusOne(recipe.id, 'add', 1)}>
                            <span className="text-xl">+1</span> Aumentar elemento
                          </div>
                          {
                            countMap[recipe.id] > 1 && (
                              <div className="flex items-center gap-2 p-3 hover:bg-gray-500 text-white cursor-pointer" onClick={() => handleMinusOne(recipe.id, 'add', -1)}>
                                <span className="text-xl">-1</span> Reducir elemento
                              </div>
                            )
                          }
                          <div className="flex items-center gap-2 p-3 hover:bg-gray-500 text-red-500 cursor-pointer" onClick={() => removeFromShoppingList(recipe.id)}>
                            <span className="text-xl">⊖</span> Eliminar de la lista de compras
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mostrar conteo actual */}
                <div className="text-neutral-400 text-sm mb-4">Cantidad: {countMap[recipe.id] || 1}</div>

                <div className="divide-y divide-neutral-700">
                  {recipe.ingredients && typeof recipe.ingredients === 'object' &&
                    Object.entries(recipe.ingredients).map(([group, items]) => (
                      <div key={group} className="py-2">
                        {group !== 'Sin título' && <h4 className="text-neutral-300 font-semibold mb-2 text-base">{group}</h4>}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {Array.isArray(items) && items.map((ingredient, idx) => {
                            let processedName = ingredient.name;
                            if (processedName.startsWith('de ')) {
                              processedName = processedName.slice(3);
                            }
                            processedName = processedName.charAt(0).toUpperCase() + processedName.slice(1);
                            const ingredientKey = `${recipe.id}-${group}-${idx}`;
                            const isChecked = checkedIngredients[ingredientKey];
                            // Multiplicar la cantidad por el count de la receta
                            let displayAmount = ingredient.amount;
                            if (ingredient.amount && countMap[recipe.id]) {
                              // Extraer número y unidad
                              const match = ingredient.amount.match(/([\d,.]+)\s*(.*)/);
                              if (match) {
                                const value = parseFloat(match[1].replace(',', '.'));
                                let unit = match[2] ? match[2].trim().toLowerCase() : '';
                                let total = value * countMap[recipe.id];
                                
                                // Función para convertir unidades
                                function convertUnit(amount, unit) {
                                  // Definir equivalencias
                                  const weightUnits = [
                                    'mg','g','gram','gramme','gramo','gramos','grams','kg','oz','ounce','onzas'
                                  ];
                                  const volumeUnits = [
                                    'ml','l','litre','litres','litro','litros','cl'
                                  ];
                                  // Normalización
                                  const unitMap = {
                                    'mg': 'mg',
                                    'g': 'g', 'gram': 'g', 'gramme': 'g', 'gramo': 'g', 'gramos': 'g', 'grams': 'g',
                                    'kg': 'kg',
                                    'oz': 'oz', 'ounce': 'oz', 'onzas': 'oz',
                                    'ml': 'ml',
                                    'l': 'l', 'litre': 'l', 'litres': 'l', 'litro': 'l', 'litros': 'l',
                                    'cl': 'cl',
                                    'cm': 'cm', 'centim': 'cm', 'centimetre': 'cm', 'centimetro': 'cm', 'centimetros': 'cm', 'centímetro': 'cm',
                                    'inch': 'in', 'inches': 'in', 'in': 'in'
                                  };
                                  const normalized = unitMap[unit] || unit;
                                  // Peso
                                  if (['mg','g','kg','oz'].includes(normalized)) {
                                    // mg -> g -> kg
                                    if (normalized === 'mg' && amount >= 1000) {
                                      return {amount: amount/1000, unit: 'g'};
                                    }
                                    if (normalized === 'g' && amount >= 1000) {
                                      return {amount: amount/1000, unit: 'kg'};
                                    }
                                    if (normalized === 'kg' && amount < 1) {
                                      return {amount: amount*1000, unit: 'g'};
                                    }
                                    if (normalized === 'oz' && amount >= 16) {
                                      return {amount: (amount/16).toFixed(2), unit: 'lb'};
                                    }
                                    return {amount, unit: normalized};
                                  }
                                  // Volumen
                                  if (['ml','cl','l'].includes(normalized)) {
                                    if (normalized === 'ml' && amount >= 1000) {
                                      return {amount: amount/1000, unit: 'l'};
                                    }
                                    if (normalized === 'cl' && amount >= 100) {
                                      return {amount: amount/100, unit: 'l'};
                                    }
                                    if (normalized === 'l' && amount < 1) {
                                      return {amount: amount*1000, unit: 'ml'};
                                    }
                                    return {amount, unit: normalized};
                                  }
                                  // Longitud
                                  if (['cm','in'].includes(normalized)) {
                                    if (normalized === 'cm' && amount >= 100) {
                                      return {amount: amount/100, unit: 'm'};
                                    }
                                    if (normalized === 'in' && amount >= 12) {
                                      return {amount: (amount/12).toFixed(2), unit: 'ft'};
                                    }
                                    return {amount, unit: normalized};
                                  }
                                  return {amount, unit};
                                }
                                const {amount: convAmount, unit: convUnit} = convertUnit(total, unit);
                                // Mostrar sin decimales si es entero, si no, con máximo 2 decimales
                                const totalStr = Number.isInteger(convAmount) ? convAmount : Number(convAmount).toFixed(2);
                                displayAmount = `${totalStr} ${convUnit}`.trim();
                              }
                            }
                            return (
                              <li
                                key={idx}
                                className={`flex items-center gap-3 bg-neutral-900 rounded-lg px-3 py-2 hover:bg-neutral-700 transition-colors duration-200 shadow-sm cursor-pointer ${isChecked ? 'opacity-50 line-through' : ''}`}
                                onClick={() => setCheckedIngredients(prev => ({ ...prev, [ingredientKey]: !prev[ingredientKey] }))}
                                aria-checked={isChecked}
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCheckedIngredients(prev => ({ ...prev, [ingredientKey]: !prev[ingredientKey] })); }}
                              >
                                {ingredient.image ? (
                                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded-full border border-neutral-700 overflow-hidden">
                                    <Image src={ingredient.image} alt={processedName} width={40} height={40} className="object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">
                                    🛒
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className={`text-white font-medium text-base truncate block ${isChecked ? 'line-through' : ''}`}>{processedName}</span>
                                  {ingredient.amount && (
                                    <span className="text-neutral-400 text-sm">{displayAmount}</span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupIngredientsByCategory(recipes, countMap)).map(([category, items]) => (
              <div key={category} className="bg-neutral-800 rounded-xl p-5 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  {IngredientCategory[category] && IngredientCategory[category][0] ? (
                    <Image src={IngredientCategory[category][0]} alt={category} width={40} height={40} className="rounded-full border border-neutral-700" />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">🛒</div>
                  )}
                  <span className="text-white text-xl font-bold tracking-tight">{category}</span>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map((ingredient, idx) => {
                    const isChecked = checkedIngredients[ingredient.key];
                    return (
                      <li
                        key={ingredient.key}
                        className={`flex items-center gap-3 bg-neutral-900 rounded-lg px-3 py-2 hover:bg-neutral-700 transition-colors duration-200 shadow-sm cursor-pointer ${isChecked ? 'opacity-50 line-through' : ''}`}
                        onClick={() => setCheckedIngredients(prev => ({ ...prev, [ingredient.key]: !prev[ingredient.key] }))}
                        aria-checked={isChecked}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setCheckedIngredients(prev => ({ ...prev, [ingredient.key]: !prev[ingredient.key] })); }}
                      >
                        {ingredient.image ? (
                          <div className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded-full border border-neutral-700 overflow-hidden">
                            <Image src={ingredient.image} alt={ingredient.processedName} width={40} height={40} className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">🛒</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={`text-white font-medium text-base truncate block ${isChecked ? 'line-through' : ''}`}>{ingredient.processedName}</span>
                          {ingredient.displayAmount && (
                            <span className="text-neutral-400 text-sm">{ingredient.displayAmount}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// Agrupar ingredientes por categoría
const { IngredientCategory } = require('../constants');
function getCategoryByImage(url) {
  for (const [category, urls] of Object.entries(IngredientCategory)) {
    if (urls.includes(url)) return category;
  }
  return 'Others';
}
function groupIngredientsByCategory(recipes, countMap) {
  const grouped = {};
  recipes.forEach(recipe => {
    Object.entries(recipe.ingredients || {}).forEach(([group, items]) => {
      (Array.isArray(items) ? items : []).forEach((ingredient, idx) => {
        const image = ingredient.image;
        const category = image ? getCategoryByImage(image) : 'Others';
        if (!grouped[category]) grouped[category] = [];
        let processedName = ingredient.name;
        if (processedName.startsWith('de ')) processedName = processedName.slice(3);
        processedName = processedName.charAt(0).toUpperCase() + processedName.slice(1);
        // Multiplicar cantidad por count
        let displayAmount = ingredient.amount;
        if (ingredient.amount && countMap[recipe.id]) {
          const match = ingredient.amount.match(/([\d,.]+)\s*(.*)/);
          if (match) {
            const value = parseFloat(match[1].replace(',', '.'));
            let unit = match[2] ? match[2].trim().toLowerCase() : '';
            let total = value * countMap[recipe.id];
            function convertUnit(amount, unit) {
              const weightUnits = ['mg','g','gram','gramme','gramo','gramos','grams','kg','oz','ounce','onzas'];
              const volumeUnits = ['ml','l','litre','litres','litro','litros','cl'];
              const unitMap = {
                'mg': 'mg', 'g': 'g', 'gram': 'g', 'gramme': 'g', 'gramo': 'g', 'gramos': 'g', 'grams': 'g',
                'kg': 'kg', 'oz': 'oz', 'ounce': 'oz', 'onzas': 'oz',
                'ml': 'ml', 'l': 'l', 'litre': 'l', 'litres': 'l', 'litro': 'l', 'litros': 'l', 'cl': 'cl',
                'cm': 'cm', 'centim': 'cm', 'centimetre': 'cm', 'centimetro': 'cm', 'centimetros': 'cm', 'centímetro': 'cm',
                'inch': 'in', 'inches': 'in', 'in': 'in'
              };
              const normalized = unitMap[unit] || unit;
              if (['mg','g','kg','oz'].includes(normalized)) {
                if (normalized === 'mg' && amount >= 1000) return {amount: amount/1000, unit: 'g'};
                if (normalized === 'g' && amount >= 1000) return {amount: amount/1000, unit: 'kg'};
                if (normalized === 'kg' && amount < 1) return {amount: amount*1000, unit: 'g'};
                if (normalized === 'oz' && amount >= 16) return {amount: (amount/16).toFixed(2), unit: 'lb'};
                return {amount, unit: normalized};
              }
              if (['ml','cl','l'].includes(normalized)) {
                if (normalized === 'ml' && amount >= 1000) return {amount: amount/1000, unit: 'l'};
                if (normalized === 'cl' && amount >= 100) return {amount: amount/100, unit: 'l'};
                if (normalized === 'l' && amount < 1) return {amount: amount*1000, unit: 'ml'};
                return {amount, unit: normalized};
              }
              if (['cm','in'].includes(normalized)) {
                if (normalized === 'cm' && amount >= 100) return {amount: amount/100, unit: 'm'};
                if (normalized === 'in' && amount >= 12) return {amount: (amount/12).toFixed(2), unit: 'ft'};
                return {amount, unit: normalized};
              }
              return {amount, unit};
            }
            const {amount: convAmount, unit: convUnit} = convertUnit(total, unit);
            const totalStr = Number.isInteger(convAmount) ? convAmount : Number(convAmount).toFixed(2);
            displayAmount = `${totalStr} ${convUnit}`.trim();
          }
        }
        grouped[category].push({
          ...ingredient,
          processedName,
          displayAmount,
          image,
          key: `${recipe.id}-${group}-${idx}`
        });
      });
    });
  });
  return grouped;
}
