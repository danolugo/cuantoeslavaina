import type { Metadata, Viewport } from 'next'
import { Inter, Source_Code_Pro } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })
const sourceCodePro = Source_Code_Pro({ 
  subsets: ['latin'],
  variable: '--font-source-code-pro'
})

export const metadata: Metadata = {
  title: '¿Cuánto es la vaina? - Conversor de Monedas',
  description: 'Convierte entre Bolívares, Dólares, Euros y Pesos Colombianos con tasas de cambio en tiempo real.',
  keywords: ['conversor', 'monedas', 'bolívar', 'dólar', 'euro', 'peso colombiano', 'tasa de cambio'],
  authors: [{ name: 'Cuánto es la vaina' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
    <html lang="es" suppressHydrationWarning className="dark">
      <body className={`${inter.className} ${sourceCodePro.variable}`}>
        {children}
      </body>
    </html>
  )
}
