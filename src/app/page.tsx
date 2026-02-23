'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CurrencySelect } from '@/components/currency-select'
import { AmountInput } from '@/components/amount-input'
import { ResultCard } from '@/components/result-card'
import { Currency, RatesResponse, Rate, CURRENCY_INFO } from '@/lib/rates/types'
import { convert } from '@/lib/rates/compose'
import { timeAgo } from '@/utils/timeago'
import { RefreshCw, AlertCircle, Globe, Calculator, BarChart3, Settings, ArrowUpRight } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'

const CURRENCIES: Currency[] = ['VES', 'USD', 'EUR', 'COP']

export default function HomePage() {
  const [baseCurrency, setBaseCurrency] = useState<Currency>('VES')
  const [amount, setAmount] = useState<number>(1)
  const [rates, setRates] = useState<RatesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'converter' | 'rates' | 'markets' | 'more'>('converter')
  const [exchangeMode, setExchangeMode] = useState<'buy' | 'sell'>('buy')

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

  // Sort currencies by their converted values (highest to lowest)
  const sortedCurrencies = otherCurrencies.sort((a, b) => {
    if (!rates?.rates) return 0
    
    const amountA = convert(amount, baseCurrency, a, rates.rates, exchangeMode)
    const amountB = convert(amount, baseCurrency, b, rates.rates, exchangeMode)
    
    // Handle null values by treating them as 0 for sorting
    const valueA = amountA ?? 0
    const valueB = amountB ?? 0
    
    return valueB - valueA
  })

  const renderConverterTab = () => (
    <div className="space-y-5 pb-4">
      {/* Cantidad a convertir - design-inspired card */}
      <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground mb-2 font-medium">Cantidad a convertir</p>
          <div className="min-h-[3rem] flex flex-col justify-center">
            <AmountInput
              value={amount}
              onChange={setAmount}
              currency={baseCurrency}
              disabled={isLoading}
              variant="display"
            />
          </div>
          <p className="text-base font-medium text-primary mt-1">
            {baseCurrency === 'VES' && 'Bs. '}
            {({ VES: 'Bolívares', USD: 'Dólares', EUR: 'Euros', COP: 'Pesos' } as const)[baseCurrency]}
          </p>
        </CardContent>
      </Card>

      {/* Moneda de origen - horizontal buttons */}
      <div>
        <p className="text-sm text-muted-foreground mb-3 font-medium">Moneda de origen</p>
        <CurrencySelect
          value={baseCurrency}
          onChange={setBaseCurrency}
          disabled={isLoading}
        />
      </div>

      {/* Tipo de cambio - Buy/Sell */}
      <div>
        <p className="text-sm text-muted-foreground mb-2 font-medium">Tipo de cambio</p>
        <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
          <Button
            variant={exchangeMode === 'buy' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setExchangeMode('buy')}
            disabled={isLoading}
            className={`flex-1 h-11 font-medium rounded-lg ${exchangeMode === 'buy' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
          >
            Compra
          </Button>
          <Button
            variant={exchangeMode === 'sell' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setExchangeMode('sell')}
            disabled={isLoading}
            className={`flex-1 h-11 font-medium rounded-lg ${exchangeMode === 'sell' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
          >
            Venta
          </Button>
        </div>
      </div>

      {/* Status and Refresh */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-xl">
          <div className={`w-2 h-2 rounded-full ${rates ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>{rates ? `Actualizado ${timeAgo(rates.at)}` : 'Cargando tasas...'}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4 rounded-xl"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results - Tasas de cambio */}
      {rates && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Tasas de cambio</h2>
            <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              {otherCurrencies.length} monedas
            </div>
          </div>
          
          <div className="space-y-2.5">
            {sortedCurrencies.map(currency => {
              const convertedAmount = rates?.rates 
                ? convert(amount, baseCurrency, currency, rates.rates, exchangeMode)
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
                  exchangeMode={exchangeMode}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Provider Notes */}
      {rates?.providerNotes && rates.providerNotes.length > 0 && (
        <Card className="bg-muted border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground font-medium">Data Sources:</strong> {rates.providerNotes.join(', ')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderRatesTab = () => (
    <div className="space-y-4">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Historical Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">Historical rates coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMarketsTab = () => (
    <div className="space-y-4">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">Market data coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMoreTab = () => (
    <div className="space-y-4">
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Settings & More</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">About</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium">Help</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - design-inspired: title, actualizado, theme toggle */}
      <div className="border-b border-border bg-card pt-safe">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Cuantoeslavaina
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {rates
                ? `Actualizado ${new Date(rates.at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}`
                : 'Cargando tasas...'}
            </p>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content - Mobile First with safe area */}
      <main className="p-4 pb-24 pb-safe max-w-lg mx-auto space-y-4">
        {activeTab === 'converter' && renderConverterTab()}
        {activeTab === 'rates' && renderRatesTab()}
        {activeTab === 'markets' && renderMarketsTab()}
        {activeTab === 'more' && renderMoreTab()}
      </main>

      {/* Mobile Bottom Navigation - safe area for notched devices */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg pb-safe">
        <div className="flex items-center justify-around py-2 px-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 ${activeTab === 'converter' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('converter')}
          >
            <Calculator className={`w-5 h-5 ${activeTab === 'converter' ? 'text-primary' : ''}`} />
            <span className="text-xs font-medium">Convert</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 ${activeTab === 'rates' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('rates')}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'rates' ? 'text-primary' : ''}`} />
            <span className="text-xs font-medium">Rates</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 ${activeTab === 'markets' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('markets')}
          >
            <Globe className={`w-5 h-5 ${activeTab === 'markets' ? 'text-primary' : ''}`} />
            <span className="text-xs font-medium">Markets</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 ${activeTab === 'more' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('more')}
          >
            <Settings className={`w-5 h-5 ${activeTab === 'more' ? 'text-primary' : ''}`} />
            <span className="text-xs font-medium">More</span>
          </Button>
        </div>
      </div>
    </div>
  )
}