import React, { memo } from 'react';

const Nutrition = ({ nutritions }) => {
  return (
    <div>
      <div className='pb-5'>
        <div className='bg-black bg-opacity-80 p-4 sm:p-6 rounded-lg'>
          <h3 className='text-xl sm:text-2xl font-bold text-green-500 mb-2'>Nutrition</h3>
          <p className='text-gray-400 mb-4'>per 1 porción</p>
          
          <div className='space-y-3 sm:space-y-4'>
            {nutritions?.map((item, index) => (
              <div key={index} className='flex justify-between items-center border-b border-gray-700 pb-2'>
                <span className='text-base sm:text-lg capitalize'>{item.name}</span>
                <span className='text-base sm:text-lg text-gray-300'>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Additional Nutrition Info */}
      <div className='pb-5 mt-6'>
        <dl>
          <dd>{nutritions?.inf_nutricional}</dd>
          {nutritions?.calorias && (
            <>
              <dt className='text-white font-bold'>Calorías</dt>
              <dd>{nutritions?.calorias}</dd>
            </>
          )}
          {nutritions?.proteina && (
            <>
              <dt className='text-white font-bold'>Proteína</dt>
              <dd>{nutritions?.proteina}</dd>
            </>
          )}
          {nutritions?.carbohidratos && (
            <>
              <dt className='text-white font-bold'>Carbohidratos</dt>
              <dd>{nutritions?.carbohidratos}</dd>
            </>
          )}
          {nutritions?.grasa && (
            <>
              <dt className='text-white font-bold'>Grasa</dt>
              <dd>{nutritions?.grasa}</dd>
            </>
          )}
          {nutritions?.grasa_saturada && (
            <>
              <dt className='text-white font-bold'>Grasa Saturada</dt>
              <dd>{nutritions?.grasa_saturada}</dd>
            </>
          )}
          {nutritions?.fibra && (
            <>
              <dt className='text-white font-bold'>Fibra</dt>
              <dd>{nutritions?.fibra}</dd>
            </>
          )}
        </dl>
      </div>
      <hr className='separator--silver-60' />
    </div>
  );
};

export default memo(Nutrition);