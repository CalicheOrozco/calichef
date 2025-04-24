import React, { memo } from 'react';
import Image from 'next/image';

const Country = ({ country, countryMap }) => {
  return (
    <>
      <div className='py-4 sm:py-8 text-white'>
        <h3 className='text-green-500 text-xl sm:text-2xl pb-4 font-bold sm:pb-8'>
        Country
        </h3>
        <ul className='flex list-none flex-row justify-start items-center flex-wrap gap-2'>
          {country?.map((item, index) => (
            <li key={index} className='flex flex-col items-center'>
              <Image className='pb-2' src={countryMap[`${item}img`]} alt={item} width={30} height={30} />
              <span className="text-sm sm:text-base">{countryMap[item]}</span>
            </li>
          ))}
        </ul>
      </div>
      <hr className='separator--silver-60' />
    </>
  );
};

export default memo(Country);
