import React, { memo } from 'react';
import Image from 'next/image';

const Collections = ({ collections }) => {
  return (
    <>
      <div className='py-4 sm:py-8 text-white'>
        <h3 className='text-green-500 text-xl sm:text-2xl font-bold pb-4 sm:pb-8'>
          También incluido en
        </h3>
        <div className='flex flex-col space-y-3 sm:space-y-4'>
          {collections.map((collection, index) => (
            <a 
              key={index} 
              href={`/collections/${collection.id}`}
              className='block'
            >
              <div className='flex items-center bg-neutral-900 p-2 sm:p-3 rounded-lg hover:bg-green-900'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 mr-3 sm:mr-4 flex-shrink-0'>
                  <Image 
                    src={collection.image_url} 
                    alt={collection.name} 
                    width={80} 
                    height={80} 
                    className='rounded-md object-cover'
                  />
                </div>
                <div className='flex flex-col'>
                  <h4 className='text-base sm:text-lg font-semibold text-white'>{collection.name}</h4>
                  <p className='text-gray-400 text-xs sm:text-sm'>
                    {collection.info ? 
                      collection.info.replace(/(.*?)(Recipes|Recetas|Recettes).*$/g, '$1$2')
                      : ''}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <hr className='separator--silver-60' />
    </>
  );
};

export default memo(Collections);