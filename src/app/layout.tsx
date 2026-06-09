import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WanDeeThai — ท่องเที่ยวคนเดี่ยวสไตล์ไทย',
  description: 'ค้นหาที่พักและไกด์ท้องถิ่นสำหรับนักท่องเที่ยวคนเดี่ยวในประเทศไทย',
  keywords: 'ท่องเที่ยว, คนเดี่ยว, ที่พัก, ไทย, ไกด์ท้องถิ่น',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
