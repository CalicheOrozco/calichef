// RecipeSections/Steps.js
import React from 'react';

export default function Steps({ steps, checkedSteps, setCheckedSteps }) {
  if (!steps) return null;
  
  return (
    <div>
      <core-list-section>
        <h3 className='text-green-500 text-xl sm:text-2xl pb-4 sm:pb-8'>
          Preparación
        </h3>
        <ol className='space-y-3 sm:space-y-4'>
          {steps.map((step, index) => {
            const stepId = `step-${index}`;
            const isChecked = checkedSteps[stepId] || false;
            
            const toggleStep = () => {
              setCheckedSteps(prev => ({
                ...prev,
                [stepId]: !isChecked
              }));
            };
            
            return (
              <li 
                key={`preparation-step-${index}`}
                className='py-2 px-3 sm:px-4 rounded-lg hover:bg-neutral-800 cursor-pointer'
                onClick={toggleStep}
              >
                <div className='preparation-step-number'>
                  <span className={`${isChecked ? 'line-through text-gray-500' : 'text-green-500'}`}>{index + 1}</span>
                </div>
                <span className={`text-sm sm:text-base ${isChecked ? 'line-through text-gray-500' : 'text-white'}`}>{step}</span>
              </li>
            );
          })}
        </ol>
      </core-list-section>
    </div>
  );
}