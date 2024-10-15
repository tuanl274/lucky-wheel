import localFont from 'next/font/local'

import dynamic from 'next/dynamic'
const Home = dynamic(() => import('@/components/Home'), { ssr: false })

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
})

export default Home
