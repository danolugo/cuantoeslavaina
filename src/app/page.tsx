'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CurrencySelect } from '@/components/currency-select'
import { AmountInput } from '@/components/amount-input'
import { ResultCard } from '@/components/result-card'
import { Currency, RatesResponse, Rate } from '@/lib/rates/types'
import { convert } from '@/lib/rates/compose'
import { timeAgo } from '@/utils/timeago'
import { RefreshCw, AlertCircle, TrendingUp, Globe, Calculator, ArrowUpRight, ArrowDownRight, Menu, Search, BarChart3, Settings } from 'lucide-react'

const CURRENCIES: Currency[] = ['VES', 'USD', 'EUR', 'COP']

export default function HomePage() {
  const [baseCurrency, setBaseCurrency] = useState<Currency>('VES')
  const [amount, setAmount] = useState<number>(1)
  const [rates, setRates] = useState<RatesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'converter' | 'rates' | 'markets' | 'more'>('converter')

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
    
    const amountA = convert(amount, baseCurrency, a, rates.rates)
    const amountB = convert(amount, baseCurrency, b, rates.rates)
    
    // Handle null values by treating them as 0 for sorting
    const valueA = amountA ?? 0
    const valueB = amountB ?? 0
    
    return valueB - valueA
  })

  const renderConverterTab = () => (
    <div className="space-y-4">
      {/* Main Amount Input - The Protagonist */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20"></div>
        <div className="relative p-8">
          <div className="text-center space-y-6">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-2">Enter Amount</p>
              <div className="text-6xl font-bold tracking-tight mb-4">
                {new Intl.NumberFormat('es-VE', {
                  style: 'currency',
                  currency: baseCurrency === 'VES' ? 'VES' : baseCurrency === 'COP' ? 'COP' : baseCurrency,
                  minimumFractionDigits: baseCurrency === 'VES' ? 0 : 2,
                  maximumFractionDigits: baseCurrency === 'VES' ? 0 : 2,
                }).format(amount)}
              </div>
            </div>
            
            {/* Currency Selection */}
            <div className="max-w-xs mx-auto">
              <CurrencySelect
                value={baseCurrency}
                onChange={setBaseCurrency}
                disabled={isLoading}
              />
            </div>
            
            {/* Amount Input */}
            <div className="max-w-xs mx-auto">
              <AmountInput
                value={amount}
                onChange={setAmount}
                currency={baseCurrency}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button 
          variant="secondary" 
          size="lg" 
          className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm rounded-xl"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Rates
        </Button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          <div className={`w-2 h-2 rounded-full ${rates ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span>
            {rates ? `Updated ${timeAgo(rates.at)}` : 'Loading rates...'}
          </span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5 shadow-lg">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results - Premium Cards (Sorted by Value) */}
      {rates && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Exchange Rates
            </h2>
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {otherCurrencies.length} currencies
            </div>
          </div>
          
          <div className="space-y-3">
            {sortedCurrencies.map(currency => {
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
      )}

      {/* Provider Notes */}
      {rates?.providerNotes && rates.providerNotes.length > 0 && (
        <Card className="bg-muted/30 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Data Sources:</strong> {rates.providerNotes.join(', ')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderRatesTab = () => (
    <div className="space-y-4">
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Historical Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Historical rates coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMarketsTab = () => (
    <div className="space-y-4">
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Market data coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMoreTab = () => (
    <div className="space-y-4">
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Settings & More</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">About</span>
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Help</span>
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"></div>
        <div className="relative flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                ¿Cuánto es la vaina?
              </h1>
              <p className="text-xs text-muted-foreground">
                Current Exchange Rates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <main className="p-4 space-y-4">
        {activeTab === 'converter' && renderConverterTab()}
        {activeTab === 'rates' && renderRatesTab()}
        {activeTab === 'markets' && renderMarketsTab()}
        {activeTab === 'more' && renderMoreTab()}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-border/50">
        <div className="flex items-center justify-around py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${activeTab === 'converter' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('converter')}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeTab === 'converter' ? 'bg-primary' : 'bg-muted'}`}>
              <Calculator className={`w-4 h-4 ${activeTab === 'converter' ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <span className="text-xs font-medium">Converter</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${activeTab === 'rates' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('rates')}
          >
            <BarChart3 className={`w-6 h-6 ${activeTab === 'rates' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs">Rates</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${activeTab === 'markets' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('markets')}
          >
            <Globe className={`w-6 h-6 ${activeTab === 'markets' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs">Markets</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center space-y-1 h-auto py-2 ${activeTab === 'more' ? 'text-primary' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('more')}
          >
            <Settings className={`w-6 h-6 ${activeTab === 'more' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>

      {/* Add bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  )
}