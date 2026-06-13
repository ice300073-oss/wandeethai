import type { Metadata } from 'next'
import { Sarabun } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import SwRegister from './sw-register'

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

const SITE_URL = 'https://wandeethai.vercel.app'
const TITLE = 'WanDeeThai — เที่ยวคนเดียว ก็เจ๋งได้'
const DESC = 'แพลตฟอร์มท่องเที่ยวคนเดี่ยวของคนไทย — ค้นหาที่พักและไกด์ท้องถิ่นที่ปลอดภัย คุ้มค่า สนุก'

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  manifest: '/manifest.json',
  themeColor: '#f97316',
  // ✅ Open Graph
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE_URL,
    siteName: 'WanDeeThai',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'WanDeeThai',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  // ✅ Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
    images: [`${SITE_URL}/og-image.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'WanDeeThai',
  },
  icons: { apple: '/icon-192.png' },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WanDeeThai" />
      </head>
      <body className={sarabun.className}>
        {/* ✅ Google Analytics — ใส่ NEXT_PUBLIC_GA_ID ใน .env.local */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {children}
        <SwRegister />
      </body>
    </html>
  )
}