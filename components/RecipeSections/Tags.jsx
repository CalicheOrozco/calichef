import React, { memo } from 'react';

const Tags = ({ tags }) => {
  return (
    <div className='py-4 sm:py-8'>
      <h3 className='text-green-500 text-xl sm:text-2xl font-bold pb-4 sm:pb-8'>
        Tags
      </h3>
      <div className='py-3 sm:py-6 flex flex-wrap gap-2 sm:gap-4'>
        {tags?.map((tag, index) => (
          <a
            key={`additional-category-${index}`}
            className='py-2 px-3 sm:py-3 sm:px-4 bg-white text-green-600 text-sm sm:text-base'
          >
            {`#${tag}`}
          </a>
        ))}
      </div>
      <hr className='separator--silver-60' />
    </div>
  );
};

export default memo(Tags);