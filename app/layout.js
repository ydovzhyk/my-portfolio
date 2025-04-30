import { GoogleTagManager } from '@next/third-parties/google'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import dynamic from 'next/dynamic'
import 'react-toastify/dist/ReactToastify.css'
import Footer from './components/footer'
import ScrollToTop from './components/helper/scroll-to-top'
const Navbar = dynamic(() => import('./components/Navbar'), { ssr: false })
// import Navbar from './components/navbar'
import './css/card.scss'
import './css/globals.scss'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portfolio of Yuriy Dovzhyk - Full Stack Developer',
  description:
    'Portfolio of Yuriy Dovzhyk – Full Stack Developer specializing in React, Next.js, Node.js, and MongoDB. Building scalable web applications and APIs.',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer />
        <main className="min-h-screen relative mx-auto pt-20 px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
          <Navbar />
          {children}
          <ScrollToTop />
        </main>
        <Footer />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
    </html>
  )
}
