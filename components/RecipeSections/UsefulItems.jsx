import React, { memo } from 'react';

const UsefulItems = ({ useful_items }) => {
  return (
    <div>
      <div className='pb-5'>
        <div className='bg-black bg-opacity-80 p-4 sm:p-6 rounded-lg'>
          <h3 className='text-xl sm:text-2xl text-green-500 font-bold mb-2'>Useful Items</h3>
          <div className='space-y-2 sm:space-y-4'>
            {useful_items?.map((item, index) => (
              <div key={index} className='flex items-center'>
                <span className='text-base sm:text-lg capitalize'>- {item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <hr className='separator--silver-60' />
    </div>
  );
};

export default memo(UsefulItems);