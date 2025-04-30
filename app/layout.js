'use client';

import { useState, useEffect } from 'react'
import { GoogleTagManager } from '@next/third-parties/google'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/footer'
import ScrollToTop from './components/helper/scroll-to-top'
import Navbar from './components/navbar'
import './css/card.scss'
import './css/globals.scss'
const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Portfolio of Yuriy Dovzhyk - Full Stack Developer',
//   description:
//     'Portfolio of Yuriy Dovzhyk – Full Stack Developer specializing in React, Next.js, Node.js, and MongoDB. Building scalable web applications and APIs.',
// }

export default function RootLayout({ children }) {
  const [activeSection, setActiveSection] = useState('');

  // This effect sets up the Intersection Observer to track the active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: '0px 0px -50% 0px',
        threshold: 0.1,
      }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section)
      })
    }
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer />
        <main className="min-h-screen relative mx-auto pt-20 px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
          <Navbar activeSection={activeSection} />
          {children}
          <ScrollToTop />
        </main>
        <Footer />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
    </html>
  )
}
