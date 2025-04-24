import React, { memo } from 'react';

const Tips = ({ tips }) => (
  tips && (
    <>
      <div className='py-4 sm:py-8 text-white'>
        <h3 className='text-green-500 text-xl sm:text-2xl font-bold pb-4 sm:pb-8'>
        Tips
        </h3>
        <ul className='flex flex-col sm:flex-row flex-wrap gap-2 mb-4'>
          {tips?.map((tip, index) => (
            <li key={`hint-and-trick-${index}`} className="text-sm sm:text-base mb-2">
              {tip}
            </li>
          ))}
        </ul>
      </div>
      <hr className='separator--silver-60' />
    </>
  )
);

export default memo(Tips);