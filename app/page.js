'use client'
import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import Card from '../components/Card'
import Navbar from '@/components/Navbar'
import { CalichefContext } from '../context/MyContext.jsx'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'more_reviews', label: 'More Reviews' },
  { value: 'less_reviews', label: 'Less Reviews' },
  { value: 'longest_prep_time', label: 'Longest Cooking Time' },
  { value: 'shortest_prep_time', label: 'Shortest Cooking Time' },
  { value: 'shortest_total_time', label: 'Shortest Total Time' },
  { value: 'longest_total_time', label: 'Longest Total Time' },
  { value: 'random', label: 'Random' },
];

// Copia la función de Navbar para convertir a minutos
const calculateTimeInMinutes = (timeString) => {
  if (!timeString) return 0;
  const matches = timeString.match(/(\d+)\s*(h|min)/gi);
  let totalMinutes = 0;
  if (matches) {
    matches.forEach(match => {
      const numberMatch = match.match(/(\d+)/);
      const unitMatch = match.match(/(h|min)/i);
      if (numberMatch && unitMatch) {
        const value = parseInt(numberMatch[1]);
        const unit = unitMatch[1].toLowerCase();
        totalMinutes += unit === 'h' ? value * 60 : value;
      }
    });
  }
  if ((!matches || totalMinutes === 0) && timeString) {
    const directNumber = parseInt(timeString);
    if (!isNaN(directNumber)) {
      totalMinutes = directNumber;
    }
  }
  return totalMinutes;
};

export default function Home() {
  const contextValue = useContext(CalichefContext)
  const [visibleCount, setVisibleCount] = useState(50)
  const [sortBy, setSortBy] = useState('random')
  const containerRef = useRef(null)
  const { AllData = [], loadingData } = contextValue || {}
  const recipesCount = AllData?.length || 0
  const sortData = (data, sortBy) => {
    console.log('sortData', data, sortBy)
    let sorted = [...data];
    if (sortBy === 'longest_prep_time') {
      sorted.sort((a, b) => 
        calculateTimeInMinutes(b.cooking_time) - calculateTimeInMinutes(a.cooking_time)
      );
    } else if (sortBy === 'shortest_prep_time') {
      sorted.sort((a, b) => 
        calculateTimeInMinutes(a.cooking_time) - calculateTimeInMinutes(b.cooking_time)
      );
    } else if (sortBy === 'shortest_total_time') {
      sorted.sort((a, b) => 
        calculateTimeInMinutes(a.total_time) - calculateTimeInMinutes(b.total_time)
      );
    } else if (sortBy === 'longest_total_time') {
      sorted.sort((a, b) => 
        calculateTimeInMinutes(b.total_time) - calculateTimeInMinutes(a.total_time)
      );
    } else if (sortBy === 'relevance') {
      sorted.sort((a, b) => {
        const scoreA = (a.rating_score || 0) * 10 + (a.rating_count || 0);
        const scoreB = (b.rating_score || 0) * 10 + (b.rating_count || 0);
        return scoreB - scoreA;
      });
    } else if (sortBy === 'more_reviews') {
      sorted.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
    } else if (sortBy === 'less_reviews') {
      sorted.sort((a, b) => (a.rating_count || 0) - (b.rating_count || 0));
    }
    return sorted;
  };
  const sortedData = useMemo(() => {
    if (!AllData || AllData.length === 0) return [];
    return sortData(AllData, sortBy);
  }, [AllData, sortBy]);
  
  const visibleData = useMemo(() => {
    return sortedData.slice(0, visibleCount);
  }, [sortedData, visibleCount]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setVisibleCount(prev => prev < recipesCount ? prev + 50 : prev);
      }
    };
    const ref = containerRef.current;
    ref?.addEventListener('scroll', handleScroll);
    return () => {
      ref?.removeEventListener('scroll', handleScroll);
    };
  }, [recipesCount]);

  if (!contextValue) {
    console.error('CalichefContext no está disponible en el componente Home')
    return null // Mejor retornar temprano si el contexto no está disponible
  }

  if (loadingData) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <svg
            className='animate-spin h-8 w-8 text-gray-600 mx-auto'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          <p className='mt-4 text-lg text-gray-600'>Loading...</p>
        </div>
      </div>
    )
  }
  return (
    <>
      <Navbar countRecipies={recipesCount} className='pb-10' />
      <div 
        ref={containerRef} 
        className='container mx-auto py-2 px-4 min-h-screen overflow-y-auto scrollbar-hidden' 
        style={{ maxHeight: 'calc(100vh - 80px)' }}
      >
        {AllData ? (
          <>
            <div className='flex flex-col sm:flex-row justify-between mb-4'>
              <p className='text-white flex justify-end items-center py-2'>
                {recipesCount} recipes found
              </p>
              <div className='flex justify-end items-center'>
                <label htmlFor='sortBy' className='text-white mr-2'>Sort By:</label>
                <select
                  id='sortBy'
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className='rounded-md px-3 py-1 bg-neutral-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='flex flex-wrap justify-center md:justify-between items-center gap-y-5'>
              {visibleData.map(item => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  rating_score={item.rating_score}
                  rating_count={item.rating_count}
                  time={item.total_time}
                  img_url={item.image_url}
                  category={item.category}
                />
              ))}
            </div>
            {visibleCount < recipesCount && (
              <div className='flex justify-center py-6'>
                <span className='text-gray-400'>Loading more recipes...</span>
              </div>
            )}
          </>
        ) : (
          <div className='flex justify-center items-center h-screen'>
            <div className='text-center'>
              <svg
                className='animate-spin h-8 w-8 text-gray-600 mx-auto'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              <p className='mt-4 text-lg text-gray-600'>Loading...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}