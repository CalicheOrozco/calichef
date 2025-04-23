import React, { memo } from 'react';
import Image from 'next/image';

const Devices = ({ devices, deviceImages }) => {
  return (
    <div>
      <div className='pb-5'>
        <div className='bg-black bg-opacity-80 p-4 sm:p-6 rounded-lg'>
          <h3 className='text-xl sm:text-2xl text-green-500 font-bold mb-2'>Dispositivos y accesorios</h3>
          <div className='space-y-3 sm:space-y-4'>
            {devices?.map((item, index) => (
              <div key={index} className='flex items-center'>
                <Image
                  src={deviceImages[item] || 'https://assets.tmecosys.com/image/upload/t_web_ingredient_48x48_2x/icons/ingredient_icons/546'}
                  alt={item}
                  width={40}
                  height={40}
                  className="sm:w-[60px] sm:h-[60px]"
                />
                <span className='text-base sm:text-lg capitalize ml-2'>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <hr className='separator--silver-60' />
    </div>
  );
};

export default memo(Devices);