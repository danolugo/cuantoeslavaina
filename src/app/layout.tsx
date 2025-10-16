import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '¿Cuánto es la vaina? - Conversor de Monedas',
  description: 'Convierte entre Bolívares, Dólares, Euros y Pesos Colombianos con tasas de cambio en tiempo real.',
  keywords: ['conversor', 'monedas', 'bolívar', 'dólar', 'euro', 'peso colombiano', 'tasa de cambio'],
  authors: [{ name: 'Cuánto es la vaina' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
