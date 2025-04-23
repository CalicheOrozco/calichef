// RecipeSections/Ingredients.js
import React from 'react';
import Image from 'next/image';

export default function Ingredients({ ingredients, checkedIngredients, setCheckedIngredients }) {
  return (
    <div className='pb-5'>
      <h3 className='text-green-500 text-xl sm:text-2xl pb-5'>
        Ingredientes
      </h3>
      <core-list-section>
        <ul className='space-y-4'>
          {ingredients && typeof ingredients === 'object' ? 
            Object.entries(ingredients).map(([group, items]) => (
              <div key={group}>
                {group !== 'Sin título' && <h4 className="text-white font-semibold mt-3 mb-2">{group}</h4>}
                {Array.isArray(items) && items.map((ingredient, index) => {
                  // Procesar el nombre del ingrediente
                  let processedName = ingredient.name;
                  if (processedName.startsWith('de ')) {
                    processedName = processedName.slice(3);
                  }
                  processedName = processedName.charAt(0).toUpperCase() + processedName.slice(1);
                  
                  const ingredientId = `${group}-${index}`;
                  const isChecked = checkedIngredients[ingredientId] || false;
                  
                  const toggleIngredient = () => {
                    setCheckedIngredients(prev => ({
                      ...prev,
                      [ingredientId]: !isChecked
                    }));
                  };
                  
                  return (
                    <li 
                      key={ingredientId} 
                      className='flex items-center justify-between py-2 px-2 sm:px-4 rounded-lg hover:bg-neutral-800 cursor-pointer'
                      onClick={toggleIngredient}
                    >
                      <div className='flex items-center gap-2 sm:gap-3'>
                        {ingredient.image && 
                          <div className='w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center'>
                            <Image 
                              src={ingredient.image} 
                              alt={processedName} 
                              width={40}
                              height={40}
                              loading="lazy" 
                              className={`object-cover ${isChecked ? 'opacity-50' : ''}`} />
                          </div>
                        }
                        <div>
                          <span className={`text-white text-sm sm:text-base ${isChecked ? 'line-through text-gray-500' : ''}`}>
                            {processedName}
                          </span>
                          {ingredient.description && 
                            <span className={`text-gray-400 text-xs sm:text-sm block ${isChecked ? 'line-through opacity-50' : ''}`}>
                              {ingredient.description}
                            </span>
                          }
                        </div>
                      </div>
                      {ingredient.amount && 
                        <span className={`text-gray-300 text-xs sm:text-sm ${isChecked ? 'line-through opacity-50' : ''}`}>
                          {ingredient.amount}
                        </span>
                      }
                    </li>
                  );
                })}
              </div>
            ))
          : null}
        </ul>
      </core-list-section>
    </div>
  );
}