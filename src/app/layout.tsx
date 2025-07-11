import Script from "next/script";
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Header from '@/components/layout/Header'
import SystemVerifier from "@/components/debug/SystemVerifier"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RanchOS - Gestión Ganadera Inteligente',
  metadataBase: new URL('https://ranchos.io'),
  description: 'Plataforma inteligente para administrar tu rancho con tecnología de punta',
  keywords: 'ganadería, rancho, gestión, ganado, México, administración',
  authors: [{ name: 'TorresLaveaga' }],
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
    other: [
      {
        rel: 'icon',
        sizes: '32x32',
        url: '/icon.svg',
      },
    ],
  },
openGraph: {

    title: 'RanchOS - Gestión Ganadera Inteligente',
    description: 'Moderniza tu rancho con nuestra plataforma inteligente',
    type: 'website',
    locale: 'es_MX',
    url: 'https://ranchos.io',
    siteName: 'RanchOS',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
    <Script src="/emergency-stop.js" strategy={"beforeInteractive"} />
        {/* Header principal */}
        <Header />
        
        {/* Contenido principal */}
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        
        {/* Sistema de notificaciones Sonner */}
        <Toaster 
          position="bottom-right"
          expand={true}
          richColors={true}
          closeButton={true}
          duration={4000}
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              padding: '16px',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            className: 'ranch-toast',
          }}
        />
        {/* process.env.NODE_ENV === "development" && <SystemVerifier /> */}
      </body>
    </html>
  )
}

import { SpeedInsights } from '@vercel/speed-insights/next'
