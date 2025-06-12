// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Header from '@/components/layout/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RanchOS - Gestión Ganadera Inteligente',
  description: 'Plataforma inteligente para administrar tu rancho con tecnología de punta',
  keywords: 'ganadería, rancho, gestión, ganado, México, administración',
  authors: [{ name: 'RanchOS Team' }],
  openGraph: {
    title: 'RanchOS - Gestión Ganadera Inteligente',
    description: 'Moderniza tu rancho con nuestra plataforma inteligente',
    type: 'website',
    locale: 'es_MX',
    url: 'https://ranchos.app',
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
      </body>
    </html>
  )
}