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
    <div className="space-y-4 pb-4">
      {/* Main Amount Display */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Amount</p>
              <div className="font-bold tracking-tight break-all overflow-hidden min-h-[3.5rem] flex items-center justify-center">
                <div 
                  className="text-center leading-none text-foreground"
                  style={{
                    fontSize: `clamp(2rem, 10vw, 3.5rem)`,
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere'
                  }}
                >
                  {new Intl.NumberFormat('es-VE', {
                    style: 'currency',
                    currency: baseCurrency === 'VES' ? 'VES' : baseCurrency === 'COP' ? 'COP' : baseCurrency,
                    minimumFractionDigits: baseCurrency === 'VES' ? 0 : 2,
                    maximumFractionDigits: baseCurrency === 'VES' ? 0 : 2,
                  }).format(amount)}
                </div>
              </div>
            </div>
            
            {/* Currency Selection */}
            <div>
              <CurrencySelect
                value={baseCurrency}
                onChange={setBaseCurrency}
                disabled={isLoading}
              />
            </div>
            
            {/* Buy/Sell Toggle */}
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-medium">Exchange Type</p>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button
                  variant={exchangeMode === 'buy' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setExchangeMode('buy')}
                  disabled={isLoading}
                  className={`flex-1 h-10 font-medium ${exchangeMode === 'buy' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                >
                  Buy
                </Button>
                <Button
                  variant={exchangeMode === 'sell' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setExchangeMode('sell')}
                  disabled={isLoading}
                  className={`flex-1 h-10 font-medium ${exchangeMode === 'sell' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                >
                  Sell
                </Button>
              </div>
            </div>
            
            {/* Amount Input */}
            <div>
              <AmountInput
                value={amount}
                onChange={setAmount}
                currency={baseCurrency}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status and Refresh */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${rates ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span>
            {rates ? `Updated ${timeAgo(rates.at)}` : 'Loading rates...'}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="h-10 px-4"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
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

      {/* Results - Exchange Rates */}
      {rates && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Exchange Rates
            </h2>
            <div className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              {otherCurrencies.length} currencies
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
      {/* Mobile Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                ¿Cuánto es la vaina?
              </h1>
              <p className="text-xs text-muted-foreground">
                Exchange Rates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <main className="p-4 pb-24 space-y-4">
        {activeTab === 'converter' && renderConverterTab()}
        {activeTab === 'rates' && renderRatesTab()}
        {activeTab === 'markets' && renderMarketsTab()}
        {activeTab === 'more' && renderMoreTab()}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
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