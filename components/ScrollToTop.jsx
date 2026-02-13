'use client'
import { useState, useEffect, useRef } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const scrollElRef = useRef(null)

  useEffect(() => {
    const isScrollable = (el) => {
      if (!el) return false
      const style = window.getComputedStyle(el)
      const overflowY = style.overflowY
      const canScroll = overflowY === 'auto' || overflowY === 'scroll'
      return canScroll && el.scrollHeight > el.clientHeight
    }

    // Prefer the explicit scroll container if it actually scrolls; otherwise fall back to the page scroll.
    const candidate = document.querySelector('.container.scrollbar-hidden') || document.querySelector('.container')
    scrollElRef.current = isScrollable(candidate) ? candidate : document.scrollingElement

    const toggleVisibility = () => {
      const el = scrollElRef.current
      if (!el) return

      const currentScrollTop = el === document.scrollingElement ? window.scrollY : el.scrollTop

      // Show button when container is scrolled up to 300px
      if (currentScrollTop > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    const el = scrollElRef.current
    if (el === document.scrollingElement) {
      window.addEventListener('scroll', toggleVisibility)
    } else if (el) {
      el.addEventListener('scroll', toggleVisibility)
    }

    // Initialize visibility based on current scroll position
    toggleVisibility()

    return () => {
      if (el === document.scrollingElement) {
        window.removeEventListener('scroll', toggleVisibility)
      } else if (el) {
        el.removeEventListener('scroll', toggleVisibility)
      }
    }
  }, [])

  const scrollToTop = () => {
    // Always scroll the window so the Navbar becomes visible.
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const el = scrollElRef.current
    if (!el || el === document.scrollingElement) return

    el.scrollTo({ top: 0, behavior: 'smooth' })
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