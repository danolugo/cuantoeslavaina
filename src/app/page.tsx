'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CurrencySelect } from '@/components/currency-select'
import { AmountInput } from '@/components/amount-input'
import { ResultCard } from '@/components/result-card'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Currency, RatesResponse, Rate } from '@/lib/rates/types'
import { convert } from '@/lib/rates/compose'
import { timeAgo } from '@/utils/timeago'
import { RefreshCw, AlertCircle } from 'lucide-react'

const CURRENCIES: Currency[] = ['VES', 'USD', 'EUR', 'COP']

export default function HomePage() {
  const [baseCurrency, setBaseCurrency] = useState<Currency>('VES')
  const [amount, setAmount] = useState<number>(1)
  const [rates, setRates] = useState<RatesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? '/api/rates?refresh=true' : '/api/rates'
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al cargar las tasas de cambio')
      }
      
      const data: RatesResponse = await response.json()
      setRates(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching rates:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchRates(true)
  }

  const otherCurrencies = CURRENCIES.filter(c => c !== baseCurrency)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                ¿Cuánto es la vaina?
              </h1>
              <p className="text-sm text-muted-foreground">
                Conversor de monedas en tiempo real
              </p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Convertir moneda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Moneda base
                  </label>
                  <CurrencySelect
                    value={baseCurrency}
                    onChange={setBaseCurrency}
                    disabled={isLoading}
                  />
                </div>
                
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  currency={baseCurrency}
                  disabled={isLoading}
                />
              </div>

              {/* Last Updated & Refresh */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {rates ? (
                    <>Actualizado {timeAgo(rates.at)}</>
                  ) : (
                    'Cargando tasas...'
                  )}
                </div>
                
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Conversiones
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherCurrencies.map(currency => {
                const convertedAmount = rates?.rates 
                  ? convert(amount, baseCurrency, currency, rates.rates)
                  : null
                
                const rateKey = `${baseCurrency}-${currency}` as keyof typeof rates.rates
                const rate = rates?.rates?.[rateKey] || null
                
                return (
                  <ResultCard
                    key={currency}
                    currency={currency}
                    amount={convertedAmount || 0}
                    rate={rate}
                    isLoading={isLoading}
                  />
                )
              })}
            </div>
          </div>

          {/* Provider Notes */}
          {rates?.providerNotes && rates.providerNotes.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <strong>Fuentes:</strong> {rates.providerNotes.join(', ')}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Tasas de cambio proporcionadas por BCV, Frankfurter y servicios públicos de FX.
            </p>
            <p className="mt-2">
              Última actualización: {rates ? timeAgo(rates.at) : 'Cargando...'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
