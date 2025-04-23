import React, { useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { CalichefContext } from '../context/MyContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';

// Utility functions moved outside of component
const processIngredientName = (name) => {
  let processed = name;
  if (processed.startsWith('de ')) {
    processed = processed.slice(3);
  }
  return processed.charAt(0).toUpperCase() + processed.slice(1);
};

const convertUnit = (amount, unit) => {
  // Define unit mappings
  const unitMap = {
    'mg': 'mg', 'g': 'g', 'gram': 'g', 'gramme': 'g', 'gramo': 'g', 'gramos': 'g', 'grams': 'g',
    'kg': 'kg', 'oz': 'oz', 'ounce': 'oz', 'onzas': 'oz',
    'ml': 'ml', 'l': 'l', 'litre': 'l', 'litres': 'l', 'litro': 'l', 'litros': 'l', 'cl': 'cl',
    'cm': 'cm', 'centim': 'cm', 'centimetre': 'cm', 'centimetro': 'cm', 'centimetros': 'cm', 'centímetro': 'cm',
    'inch': 'in', 'inches': 'in', 'in': 'in'
  };
  
  const normalized = unitMap[unit] || unit;
  
  // Weight conversions
  if (['mg','g','kg','oz'].includes(normalized)) {
    if (normalized === 'mg' && amount >= 1000) return {amount: amount/1000, unit: 'g'};
    if (normalized === 'g' && amount >= 1000) return {amount: amount/1000, unit: 'kg'};
    if (normalized === 'kg' && amount < 1) return {amount: amount*1000, unit: 'g'};
    if (normalized === 'oz' && amount >= 16) return {amount: (amount/16).toFixed(2), unit: 'lb'};
  }
  // Volume conversions
  else if (['ml','cl','l'].includes(normalized)) {
    if (normalized === 'ml' && amount >= 1000) return {amount: amount/1000, unit: 'l'};
    if (normalized === 'cl' && amount >= 100) return {amount: amount/100, unit: 'l'};
    if (normalized === 'l' && amount < 1) return {amount: amount*1000, unit: 'ml'};
  }
  // Length conversions
  else if (['cm','in'].includes(normalized)) {
    if (normalized === 'cm' && amount >= 100) return {amount: amount/100, unit: 'm'};
    if (normalized === 'in' && amount >= 12) return {amount: (amount/12).toFixed(2), unit: 'ft'};
  }
  
  return {amount, unit: normalized};
};

const calculateDisplayAmount = (originalAmount, count) => {
  if (!originalAmount || !count) return originalAmount;
  
  const match = originalAmount.match(/([\d,.]+)\s*(.*)/);
  if (!match) return originalAmount;
  
  const value = parseFloat(match[1].replace(',', '.'));
  const unit = match[2] ? match[2].trim().toLowerCase() : '';
  const total = value * count;
  
  const {amount: convAmount, unit: convUnit} = convertUnit(total, unit);
  const totalStr = Number.isInteger(convAmount) ? convAmount : Number(convAmount).toFixed(2);
  
  return `${totalStr} ${convUnit}`.trim();
};

// Extracted component for menu
const RecipeMenu = ({ isOpen, recipeId, countMap, onPlusOne, onMinusOne, onRemove }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute bg-neutral-800 rounded-lg shadow-lg mt-2 right-0 w-64 z-10">
      <div className="flex flex-col gap-4">
        <div 
          className="flex items-center gap-2 p-3 hover:bg-gray-500 text-white cursor-pointer" 
          onClick={() => onPlusOne(recipeId)}
        >
          <span className="text-xl">+1</span> Aumentar elemento
        </div>
        {countMap[recipeId] > 1 && (
          <div 
            className="flex items-center gap-2 p-3 hover:bg-gray-500 text-white cursor-pointer" 
            onClick={() => onMinusOne(recipeId)}
          >
            <span className="text-xl">-1</span> Reducir elemento
          </div>
        )}
        <div 
          className="flex items-center gap-2 p-3 hover:bg-gray-500 text-red-500 cursor-pointer" 
          onClick={() => onRemove(recipeId)}
        >
          <span className="text-xl">⊖</span> Eliminar de la lista de compras
        </div>
      </div>
    </div>
  );
};

// Extracted component for ingredient item
const IngredientItem = ({ ingredient, idx, recipeId, group, count, isChecked, onToggleCheck }) => {
  const processedName = processIngredientName(ingredient.name);
  const displayAmount = calculateDisplayAmount(ingredient.amount, count);
  const ingredientKey = `${recipeId}-${group}-${idx}`;
  
  return (
    <li
      className={`flex items-center gap-3 bg-neutral-900 rounded-lg px-3 py-2 hover:bg-neutral-700 transition-colors duration-200 shadow-sm cursor-pointer ${isChecked ? 'opacity-50 line-through' : ''}`}
      onClick={() => onToggleCheck(ingredientKey)}
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggleCheck(ingredientKey); }}
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
        <span className={`text-white font-medium text-base truncate block ${isChecked ? 'line-through' : ''}`}>
          {processedName}
        </span>
        {displayAmount && (
          <span className="text-neutral-400 text-sm">{displayAmount}</span>
        )}
      </div>
    </li>
  );
};

// Extracted component for recipe view
const RecipeView = ({ recipes, countMap, menuOpen, menuRefs, toggleMenu, handlePlusOne, 
                    handleMinusOne, removeFromShoppingList, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="space-y-10">
      {recipes.map(recipe => (
        <div key={recipe.id} className="bg-neutral-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/${recipe.id}`} passHref>
              <Image 
                src={recipe.image_url} 
                alt={recipe.title} 
                width={70} 
                height={70} 
                className="rounded-lg object-cover border border-neutral-700" 
              />
            </Link>
            <Link href={`/${recipe.id}`} passHref>
              <span className="text-white text-xl font-bold tracking-tight">{recipe.title}</span>
            </Link>

            <div 
              className="relative text-white ml-auto cursor-pointer" 
              onClick={() => toggleMenu(recipe.id)} 
              ref={el => (menuRefs.current[recipe.id] = el)}
            >
              <FaEllipsisV />
              <RecipeMenu 
                isOpen={menuOpen[recipe.id]} 
                recipeId={recipe.id}
                countMap={countMap}
                onPlusOne={handlePlusOne}
                onMinusOne={handleMinusOne}
                onRemove={removeFromShoppingList}
              />
            </div>
          </div>

          <div className="text-neutral-400 text-sm mb-4">Cantidad: {countMap[recipe.id] || 1}</div>

          <div className="divide-y divide-neutral-700">
            {recipe.ingredients && typeof recipe.ingredients === 'object' &&
              Object.entries(recipe.ingredients).map(([group, items]) => (
                <div key={group} className="py-2">
                  {group !== 'Sin título' && (
                    <h4 className="text-neutral-300 font-semibold mb-2 text-base">{group}</h4>
                  )}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.isArray(items) && items.map((ingredient, idx) => {
                      const ingredientKey = `${recipe.id}-${group}-${idx}`;
                      return (
                        <IngredientItem 
                          key={idx}
                          ingredient={ingredient}
                          idx={idx}
                          recipeId={recipe.id}
                          group={group}
                          count={countMap[recipe.id]}
                          isChecked={checkedIngredients[ingredientKey]}
                          onToggleCheck={setCheckedIngredients}
                        />
                      );
                    })}
                  </ul>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Main hook to group ingredients by category - moved outside to reduce re-renders
const useGroupedIngredients = (recipes, countMap, IngredientCategory) => {
  return useMemo(() => {
    const getCategoryByImage = (url) => {
      for (const [category, urls] of Object.entries(IngredientCategory)) {
        if (urls.includes(url)) return category;
      }
      return 'Others';
    };
    
    const grouped = {};
    
    recipes.forEach(recipe => {
      Object.entries(recipe.ingredients || {}).forEach(([group, items]) => {
        (Array.isArray(items) ? items : []).forEach((ingredient, idx) => {
          const image = ingredient.image;
          const category = image ? getCategoryByImage(image) : 'Others';
          
          if (!grouped[category]) grouped[category] = [];
          
          const processedName = processIngredientName(ingredient.name);
          const displayAmount = calculateDisplayAmount(ingredient.amount, countMap[recipe.id]);
          
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
  }, [recipes, countMap, IngredientCategory]);
};

// Category view component
const CategoryView = ({ groupedIngredients, IngredientCategory, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="space-y-10">
      {Object.entries(groupedIngredients).map(([category, items]) => (
        <div key={category} className="bg-neutral-800 rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-4 mb-4">
            {IngredientCategory[category] && IngredientCategory[category][0] ? (
              <Image 
                src={IngredientCategory[category][0]} 
                alt={category} 
                width={40} 
                height={40} 
                className="rounded-full border border-neutral-700" 
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">
                🛒
              </div>
            )}
            <span className="text-white text-xl font-bold tracking-tight">{category}</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {items.map((ingredient) => {
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
                    <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">
                      🛒
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={`text-white font-medium text-base truncate block ${isChecked ? 'line-through' : ''}`}>
                      {ingredient.processedName}
                    </span>
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
  );
};

// Custom hook for menu click outside handling
const useClickOutside = (menuOpen, menuRefs, setMenuOpen) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const openIds = Object.keys(menuOpen).filter(id => menuOpen[id]);
      if (openIds.length === 0) return;
      
      let shouldClose = true;
      for (const id of openIds) {
        if (menuRefs.current[id] && menuRefs.current[id].contains(event.target)) {
          shouldClose = false;
          break;
        }
      }
      
      if (shouldClose) {
        setMenuOpen({});
      }
    };

    if (Object.values(menuOpen).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, menuRefs, setMenuOpen]);
};

// Main component
export default function ShoppingList({ list }) {
  const { IngredientCategory } = require('../constants');
  const contextValue = useContext(CalichefContext);
  const { originalData, setShoppingList, fetchShoppingList } = contextValue || {};
  const { updateShoppingList } = useAuth();

  const [menuOpen, setMenuOpen] = useState({});
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [viewMode, setViewMode] = useState('recipe');
  const menuRefs = useRef({});

  // Use our custom hook for click outside handling
  useClickOutside(menuOpen, menuRefs, setMenuOpen);

  // Memoize the extraction of idList and countMap
  const { idList, countMap } = useMemo(() => {
    const ids = list?.map(item => item.idRecipe) || [];
    const counts = list?.reduce((acc, item) => {
      acc[item.idRecipe] = item.count;
      return acc;
    }, {}) || {};
    
    return { idList: ids, countMap: counts };
  }, [list]);

  // Memoize the filtered recipes
  const recipes = useMemo(() => {
    return originalData && idList.length
      ? originalData.filter(recipe => idList.includes(recipe.id))
      : [];
  }, [originalData, idList]);

  // Memoize grouped ingredients for category view
  const groupedIngredients = useGroupedIngredients(recipes, countMap, IngredientCategory);

  // Action handlers with useCallback to prevent unnecessary re-renders
  const toggleMenu = useCallback((id) => {
    setMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handlePlusOne = useCallback(async (idRecipe) => {
    await updateShoppingList(idRecipe, 'add', 1);
    await fetchShoppingList();
  }, [updateShoppingList, fetchShoppingList]);

  const handleMinusOne = useCallback(async (idRecipe) => {
    await updateShoppingList(idRecipe, 'add', -1);
    await fetchShoppingList();
  }, [updateShoppingList, fetchShoppingList]);

  const removeFromShoppingList = useCallback(async (idRecipe) => {
    await updateShoppingList(idRecipe, 'delete');
    setShoppingList(prevList => prevList.filter(item => item.idRecipe !== idRecipe));
    await fetchShoppingList();
  }, [updateShoppingList, setShoppingList, fetchShoppingList]);

  // Toggle checked state for an ingredient
  const toggleIngredientChecked = useCallback((ingredientKey) => {
    setCheckedIngredients(prev => ({ 
      ...prev, 
      [ingredientKey]: !prev[ingredientKey] 
    }));
  }, []);

  return (
    <div className="bg-neutral-900 rounded-lg shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <button 
          className={`px-4 py-2 rounded ${viewMode === 'recipe' ? 'bg-green-700 text-white' : 'bg-neutral-800 text-neutral-300'}`} 
          onClick={() => setViewMode('recipe')}
        >
          Por recetas
        </button>
        <button 
          className={`px-4 py-2 rounded ${viewMode === 'category' ? 'bg-green-700 text-white' : 'bg-neutral-800 text-neutral-300'}`} 
          onClick={() => setViewMode('category')}
        >
          Por categoría
        </button>
      </div>
      
      {recipes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-white text-lg">No hay ingredientes para mostrar.</p>
        </div>
      ) : viewMode === 'recipe' ? (
        <RecipeView 
          recipes={recipes}
          countMap={countMap}
          menuOpen={menuOpen}
          menuRefs={menuRefs}
          toggleMenu={toggleMenu}
          handlePlusOne={handlePlusOne}
          handleMinusOne={handleMinusOne}
          removeFromShoppingList={removeFromShoppingList}
          checkedIngredients={checkedIngredients}
          setCheckedIngredients={toggleIngredientChecked}
        />
      ) : (
        <CategoryView 
          groupedIngredients={groupedIngredients}
          IngredientCategory={IngredientCategory}
          checkedIngredients={checkedIngredients}
          setCheckedIngredients={toggleIngredientChecked}
        />
      )}
    </div>
  );
}