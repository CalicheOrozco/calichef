'use client'
import { useState, useEffect, useRef } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    // Find the container with the class that has the cards scroll
    containerRef.current = document.querySelector('.container.scrollbar-hidden') || document.querySelector('.container')

    const toggleVisibility = () => {
      if (!containerRef.current) return

      // Show button when container is scrolled up to 300px
      if (containerRef.current.scrollTop > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    const currentContainer = containerRef.current
    if (currentContainer) {
      currentContainer.addEventListener('scroll', toggleVisibility)
    }

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', toggleVisibility)
      }
    }
  }, [])

  const scrollToTop = () => {
    if (!containerRef.current) return
    
    containerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  )
}

export default ScrollToTop 