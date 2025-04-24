/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import React, { useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { CalichefContext } from '../context/MyContext';
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image';
import { FaEllipsisV } from 'react-icons/fa';
import Link from 'next/link';

// Extraer la lógica de conversión de unidades
const unitMap = {
  'mg': 'mg', 'g': 'g', 'gram': 'g', 'gramme': 'g', 'gramo': 'g', 'gramos': 'g', 'grams': 'g',
  'kg': 'kg', 'oz': 'oz', 'ounce': 'oz', 'onzas': 'oz',
  'ml': 'ml', 'l': 'l', 'litre': 'l', 'litres': 'l', 'litro': 'l', 'litros': 'l', 'cl': 'cl',
  'cm': 'cm', 'centim': 'cm', 'centimetre': 'cm', 'centimetro': 'cm', 'centimetros': 'cm', 'centímetro': 'cm',
  'inch': 'in', 'inches': 'in', 'in': 'in'
};

const convertUnit = (amount, unit) => {
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
};

const processIngredient = (ingredient, count = 1) => {
  let processedName = ingredient.name;
  if (processedName?.startsWith('de ')) {
    processedName = processedName.slice(3);
  }
  if (processedName) {
    processedName = processedName.charAt(0).toUpperCase() + processedName.slice(1);
  }
  
  let displayAmount = ingredient.amount;
  if (ingredient.amount && count > 0) {
    const match = ingredient.amount.match(/([\d,.]+)\s*(.*)/);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      let unit = match[2] ? match[2].trim().toLowerCase() : '';
      let total = value * count;
      
      const {amount: convAmount, unit: convUnit} = convertUnit(total, unit);
      const totalStr = Number.isInteger(convAmount) ? convAmount : Number(convAmount).toFixed(2);
      displayAmount = `${totalStr} ${convUnit}`.trim();
    }
  }
  
  return { processedName, displayAmount };
};

// Importar constantes
const { IngredientCategory } = require('../constants');

const getCategoryByImage = (url) => {
  for (const [category, urls] of Object.entries(IngredientCategory)) {
    if (urls.includes(url)) return category;
  }
  return 'Others';
};

// Componente de elemento de ingrediente memoizado
const IngredientItem = React.memo(({ ingredient, isChecked, toggleChecked }) => {
  return (
    <li
      className={`flex items-center gap-3 bg-neutral-900 rounded-lg px-3 py-2 hover:bg-neutral-700 transition-colors duration-200 shadow-sm cursor-pointer ${isChecked ? 'opacity-50 line-through' : ''}`}
      onClick={toggleChecked}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleChecked(); }}
    >
      {ingredient.image ? (
        <div className="w-10 h-10 flex items-center justify-center bg-neutral-800 rounded-full border border-neutral-700 overflow-hidden">
          <Image src={ingredient.image} alt={ingredient.processedName || ingredient.name} width={40} height={40} className="object-cover" />
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">
          🛒
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-white font-medium text-base truncate block ${isChecked ? 'line-through' : ''}`}>
          {ingredient.processedName || ingredient.name}
        </span>
        {ingredient.displayAmount && (
          <span className="text-neutral-400 text-sm">{ingredient.displayAmount}</span>
        )}
      </div>
    </li>
  );
});

IngredientItem.displayName = 'IngredientItem';

// Componente de menú de receta memoizado
const RecipeMenu = React.memo(({ isOpen, recipeId, countMap, handlePlusOne, handleMinusOne, removeFromShoppingList }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute bg-neutral-800 rounded-lg shadow-lg mt-2 right-0 w-64 z-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 p-3 hover:bg-green-900 text-white cursor-pointer" onClick={() => handlePlusOne(recipeId)}>
          <span className="text-xl">+1</span> Increase recipe
        </div>
        {countMap[recipeId] > 1 && (
          <div className="flex items-center gap-2 p-3 hover:bg-green-900 text-white cursor-pointer" onClick={() => handleMinusOne(recipeId)}>
            <span className="text-xl">-1</span> Decrease recipe
          </div>
        )}
        <div className="flex items-center gap-2 p-3 hover:bg-red-500 hover:text-white text-red-500 cursor-pointer" onClick={() => removeFromShoppingList(recipeId)}>
          <span className="text-xl">⊖</span> Remove from shopping list  
        </div>
      </div>
    </div>
  );
});

RecipeMenu.displayName = 'RecipeMenu';

// Componente de lista de ingredientes por grupo
const IngredientGroup = React.memo(({ group, items, recipeId, countMap, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="py-2">
      {group !== 'Sin título' && <h4 className="text-neutral-300 font-semibold mb-2 text-base">{group}</h4>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {Array.isArray(items) && items.map((ingredient, idx) => {
          const ingredientKey = `${recipeId}-${group}-${idx}`;
          const isChecked = checkedIngredients[ingredientKey];
          const { processedName, displayAmount } = processIngredient(ingredient, countMap[recipeId] || 1);
          
          const handleIngredientToggle = useCallback(() => {
            setCheckedIngredients(prev => ({ ...prev, [ingredientKey]: !prev[ingredientKey] }));
          }, [ingredientKey]);
          
          return (
            <IngredientItem 
              key={idx}
              ingredient={{...ingredient, processedName, displayAmount}}
              isChecked={isChecked}
              toggleChecked={handleIngredientToggle}
            />
          );
        })}
      </ul>
    </div>
  );
});

IngredientGroup.displayName = 'IngredientGroup';

// Componente de receta memoizado
const RecipeCard = React.memo(({ recipe, countMap, menuOpen, toggleMenu, menuRefs, handlePlusOne, handleMinusOne, removeFromShoppingList, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="bg-neutral-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <Link href={`/${recipe.id}`} passHref>
          <Image src={recipe.image_url} alt={recipe.title} width={70} height={70} className="rounded-lg object-cover border border-neutral-700" />
        </Link>
        <Link href={`/${recipe.id}`} passHref>
          <span className="text-white text-xl font-bold tracking-tight">{recipe.title}</span>
        </Link>

        <div 
          className="relative text-white ml-auto cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu(recipe.id);
          }} 
          ref={el => (menuRefs.current[recipe.id] = el)}
        >
          <FaEllipsisV />
          <RecipeMenu 
            isOpen={menuOpen[recipe.id]} 
            recipeId={recipe.id}
            countMap={countMap}
            handlePlusOne={handlePlusOne}
            handleMinusOne={handleMinusOne}
            removeFromShoppingList={removeFromShoppingList}
          />
        </div>
      </div>

      <div className="text-neutral-400 text-sm mb-4">Amount: {countMap[recipe.id] || 1}</div>

      <div className="divide-y divide-neutral-700">
        {recipe.ingredients && typeof recipe.ingredients === 'object' &&
          Object.entries(recipe.ingredients).map(([group, items]) => (
            <IngredientGroup 
              key={group}
              group={group}
              items={items}
              recipeId={recipe.id}
              countMap={countMap}
              checkedIngredients={checkedIngredients}
              setCheckedIngredients={setCheckedIngredients}
            />
          ))}
      </div>
    </div>
  );
});

RecipeCard.displayName = 'RecipeCard';

// Vista por receta memoizada
const RecipeView = React.memo(({ recipes, countMap, menuOpen, toggleMenu, menuRefs, handlePlusOne, handleMinusOne, removeFromShoppingList, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="space-y-10">
      {recipes.map(recipe => (
        <RecipeCard 
          key={recipe.id}
          recipe={recipe}
          countMap={countMap}
          menuOpen={menuOpen}
          toggleMenu={toggleMenu}
          menuRefs={menuRefs}
          handlePlusOne={handlePlusOne}
          handleMinusOne={handleMinusOne}
          removeFromShoppingList={removeFromShoppingList}
          checkedIngredients={checkedIngredients}
          setCheckedIngredients={setCheckedIngredients}
        />
      ))}
    </div>
  );
});

RecipeView.displayName = 'RecipeView';

// Categoría de ingredientes memoizada
const CategoryGroup = React.memo(({ category, items, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="bg-neutral-800 rounded-xl p-5 shadow-md">
      <div className="flex items-center gap-4 mb-4">
        {IngredientCategory[category] && IngredientCategory[category][0] ? (
          <Image src={IngredientCategory[category][0]} alt={category} width={40} height={40} className="rounded-full border border-neutral-700" />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full text-neutral-400 text-xl font-bold">🛒</div>
        )}
        <span className="text-white text-xl font-bold tracking-tight">{category}</span>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {items.map((ingredient) => {
          const isChecked = checkedIngredients[ingredient.key];
          
          const handleIngredientToggle = useCallback(() => {
            setCheckedIngredients(prev => ({ ...prev, [ingredient.key]: !prev[ingredient.key] }));
          }, [ingredient.key]);
          
          return (
            <IngredientItem 
              key={ingredient.key}
              ingredient={ingredient}
              isChecked={isChecked}
              toggleChecked={handleIngredientToggle}
            />
          );
        })}
      </ul>
    </div>
  );
});

CategoryGroup.displayName = 'CategoryGroup';

// Vista por categoría memoizada
const CategoryView = React.memo(({ groupedIngredients, checkedIngredients, setCheckedIngredients }) => {
  return (
    <div className="space-y-10">
      {Object.entries(groupedIngredients).map(([category, items]) => (
        <CategoryGroup 
          key={category}
          category={category}
          items={items}
          checkedIngredients={checkedIngredients}
          setCheckedIngredients={setCheckedIngredients}
        />
      ))}
    </div>
  );
});

CategoryView.displayName = 'CategoryView';

// Componente principal optimizado
const ShoppingList = ({ list }) => {
  // Un solo console.log para verificar
  const listRef = useRef(list);
  if (JSON.stringify(listRef.current) !== JSON.stringify(list)) {
    console.log('ShoppingList received new list:', list?.length);
    listRef.current = list;
  }

  const contextValue = useContext(CalichefContext);
  const { originalData, setShoppingList, fetchShoppingList } = contextValue || {};
  const { updateShoppingList } = useAuth();
  const [menuOpen, setMenuOpen] = useState({});
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const menuRefs = useRef({});
  const [viewMode, setViewMode] = useState('recipe');

  // Handle clicking outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      const openIds = Object.keys(menuOpen).filter(id => menuOpen[id]);
      
      if (openIds.length === 0) return;
      
      let shouldClose = false;
      for (const id of openIds) {
        if (menuRefs.current[id] && !menuRefs.current[id].contains(event.target)) {
          shouldClose = true;
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
  }, [menuOpen]);
  
  // Memoize derived data
  const { idlist, countMap, recipes } = useMemo(() => {
    if (!list || !originalData) {
      return { idlist: [], countMap: {}, recipes: [] };
    }
    
    const idlist = list.map(item => item.idRecipe);
    const countMap = list.reduce((acc, item) => {
      acc[item.idRecipe] = item.count;
      return acc;
    }, {});
    
    const recipes = originalData.filter(recipe => idlist.includes(recipe.id));
      
    return { idlist, countMap, recipes };
  }, [list, originalData]);

  // Memoize grouped ingredients
  const groupedIngredients = useMemo(() => {
    if (!recipes.length) return {};
    
    const grouped = {};
    recipes.forEach(recipe => {
      Object.entries(recipe.ingredients || {}).forEach(([group, items]) => {
        (Array.isArray(items) ? items : []).forEach((ingredient, idx) => {
          const image = ingredient.image;
          const category = image ? getCategoryByImage(image) : 'Others';
          if (!grouped[category]) grouped[category] = [];
          
          const { processedName, displayAmount } = processIngredient(ingredient, countMap[recipe.id] || 1);
          
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
  }, [recipes, countMap]);

  // Event handlers with useCallback
  const toggleMenu = useCallback((id) => {
    setMenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const removeFromShoppingList = useCallback(async (idRecipe) => {
    if (!updateShoppingList || !setShoppingList || !fetchShoppingList) return;
    await updateShoppingList(idRecipe, 'delete');
    setShoppingList(prevList => prevList.filter(item => item.idRecipe !== idRecipe));
    await fetchShoppingList();
  }, [updateShoppingList, setShoppingList, fetchShoppingList]);

  const handlePlusOne = useCallback(async (idRecipe) => {
    if (!updateShoppingList || !fetchShoppingList) return;
    await updateShoppingList(idRecipe, 'add', 1);
    await fetchShoppingList();
  }, [updateShoppingList, fetchShoppingList]);
  
  const handleMinusOne = useCallback(async (idRecipe) => {
    if (!updateShoppingList || !fetchShoppingList) return;
    await updateShoppingList(idRecipe, 'add', -1);
    await fetchShoppingList();
  }, [updateShoppingList, fetchShoppingList]);

  const setViewModeRecipe = useCallback(() => setViewMode('recipe'), []);
  const setViewModeCategory = useCallback(() => setViewMode('category'), []);

  return (
    <div className="bg-neutral-900 rounded-lg shadow-lg p-6">
      <div className="flex gap-4 mb-6">
        <button 
          className={`px-4 py-2 rounded ${viewMode==='recipe'?'bg-green-700 text-white':'bg-neutral-800 text-neutral-300'}`} 
          onClick={setViewModeRecipe}
        >
          By Recipe <span className='bg-green-300 text-sm text-green-800 p-0.5 px-1 rounded-full'>{list?.length}</span>
        </button>
        <button 
          className={`px-4 py-2 rounded ${viewMode==='category'?'bg-green-700 text-white':'bg-neutral-800 text-neutral-300'}`} 
          onClick={setViewModeCategory}
        >
          By Category
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
          toggleMenu={toggleMenu}
          menuRefs={menuRefs}
          handlePlusOne={handlePlusOne}
          handleMinusOne={handleMinusOne}
          removeFromShoppingList={removeFromShoppingList}
          checkedIngredients={checkedIngredients}
          setCheckedIngredients={setCheckedIngredients}
        />
      ) : (
        <CategoryView 
          groupedIngredients={groupedIngredients}
          checkedIngredients={checkedIngredients}
          setCheckedIngredients={setCheckedIngredients}
        />
      )}
    </div>
  );
};

// Envolver todo el componente con React.memo y un comparador personalizado
export default React.memo(ShoppingList, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.list) === JSON.stringify(nextProps.list);
});