// RecipeSections/Recommended.js
import React from 'react';
import Card from '../Card';

export default function Recommended({ recommended, currentId }) {
  if (!recommended || recommended.length === 0) return null;
  
  return (
    <div className='recommended-recipes px-4 sm:px-5 py-6 sm:py-8'>
      <h2 className='text-green-500 text-2xl sm:text-3xl pb-4'>Recetas alternativas</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {recommended
          .filter(item => item.id !== currentId) // Filter out the current recipe
          .filter((item, index, self) => 
            index === self.findIndex((t) => t.id === item.id) // Filter out duplicates
          )
          .slice(0, 6) // Limit to 6 recommendations
          .map((item) => (
            <Card
              key={item.id}
              id={item.id}
              title={item.title}
              rating_score={item.rating_score}
              rating_count={item.rating_count}
              time={item.total_time}
              img_url={item.img_url}
              category={item.category}
            />
          ))}
      </div>
    </div>
  );
}