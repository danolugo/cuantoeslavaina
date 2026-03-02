import type { Metadata, Viewport } from 'next'
import { Inter, Outfit, Source_Code_Pro } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
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
  themeColor: '#040B16',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} ${sourceCodePro.variable} font-sans antialiased text-white`}>
        {children}
      </body>
    </html>
  )
}
