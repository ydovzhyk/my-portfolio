'use client'

import { useEffect, useState } from 'react'

const DEFAULT_BTN_CLS =
  'fixed bottom-8 right-6 z-50 flex items-center rounded-full bg-gradient-to-r from-pink-500 to-violet-600 p-4 hover:text-xl transition-all duration-300 ease-out'
const SCROLL_THRESHOLD = 150

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      className={`${DEFAULT_BTN_CLS} ${isVisible ? 'block' : 'hidden'}`}
      onClick={scrollToTop}
    >
      <div className={`triangle ${isVisible ? 'animate-blink' : ''}`}></div>
      YD
    </button>
  )
}

export default ScrollToTop;


