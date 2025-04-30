import { GoogleTagManager } from '@next/third-parties/google'
import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css'
import ClientLayout from './ClientLayout'
import Footer from './components/footer'
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
        <ClientLayout>{children}</ClientLayout>
        <Footer />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
    </html>
  )
}
