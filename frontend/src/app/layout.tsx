import '@/styles/globals.css'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'



const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://primekurye.com'

// ✅ FONTLAR (performanslı)
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-barlow-condensed',
})

// ================================
// METADATA
// ================================
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Vın Kurye — İstanbul'un En Hızlı Motokurye Hizmeti",
    template: '%s | Vın Kurye',
  },
  description:
    "İstanbul'da bireyler ve işletmeler için motokurye hizmeti. 60-90 dakikada teslim, gerçek zamanlı takip, %99.9 başarı oranı. Hemen kurye çağır!",
  keywords: [
    'motokurye', 'kurye hizmeti', 'istanbul kurye', 'ekspres kurye',
    'aynı gün teslimat', 'kurye çağır', 'prime kurye', 'hızlı teslimat',
    'istanbul motokurye', 'işletme kurye', 'paket gönder istanbul',
  ],
  authors: [{ name: 'Vın Kurye' }],
  creator: 'Vın Kurye',
  publisher: 'Vın Kurye',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: APP_URL,
    siteName: 'Vın Kurye',
    title: "Vın Kurye — İstanbul'un En Hızlı Motokurye Hizmeti",
    description: "60-90 dakikada teslim, gerçek zamanlı takip, %99.9 başarı oranı.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vın Kurye',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vın Kurye — İstanbul'un En Hızlı Motokurye Hizmeti",
    description: "60-90 dakikada teslim, gerçek zamanlı takip, %99.9 başarı oranı.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

// ================================
// VIEWPORT
// ================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#c8860a',
}

// ================================
// ROOT LAYOUT
// ================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={`${barlow.className} ${barlowCondensed.variable} m-0 p-0`}>

        {children}

        {/* ✅ JSON-LD (SEO) */}
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Vın Kurye',
              url: APP_URL,
              telephone: '+902121234567',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'İstanbul',
                addressCountry: 'TR',
              },
            }),
          }}
        />

        {/* ✅ TOASTER */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              padding: '14px 18px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
      </body>
    </html>
  )
}