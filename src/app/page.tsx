'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CurrencySelect } from '@/components/currency-select'
import { AmountInput } from '@/components/amount-input'
import { ResultCard } from '@/components/result-card'
import { Currency, RatesResponseV1, CURRENCY_INFO } from '@/lib/rates/types'
import { convert } from '@/lib/rates/compose'
import { ArrowLeft, Settings, ArrowDownUp, RefreshCw, AlertCircle } from 'lucide-react'

const CURRENCIES: Currency[] = ['VES', 'USD', 'EUR', 'COP']

export default function HomePage() {
  const [baseCurrency, setBaseCurrency] = useState<Currency>('VES')
  const [amount, setAmount] = useState<number>(1)
  const [rates, setRates] = useState<RatesResponseV1 | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exchangeMode, setExchangeMode] = useState<'buy' | 'sell'>('buy')
  const [hasConverted, setHasConverted] = useState<boolean>(false)
  const [vesBaseRateType, setVesBaseRateType] = useState<'official' | 'market'>('official')

  const fetchRates = async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? '/api/rates?refresh=true' : '/api/rates'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Error al cargar las tasas de cambio')
      }

      const data: RatesResponseV1 = await response.json()
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

    const resolvedRateType = baseCurrency === 'VES' ? vesBaseRateType : 'official'

    const amountA = convert(amount, baseCurrency, a, rates.rates, exchangeMode, resolvedRateType)
    const amountB = convert(amount, baseCurrency, b, rates.rates, exchangeMode, resolvedRateType)

    const valueA = amountA ?? 0
    const valueB = amountB ?? 0

    return valueB - valueA
  })

  return (
    <div className="min-h-screen bg-app-bg text-white relative overflow-x-hidden font-sans">
      {/* Background Abstract Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[50%] bg-neo-blue/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-20%] w-[50%] h-[50%] bg-neo-cyan/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <div className="pt-safe relative z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Button>
          <h1 className="text-xl font-medium tracking-wide">Cuantoeslavaina</h1>
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors">
            <Settings className="w-5 h-5 text-white/70" />
          </Button>
        </div>
      </div>

      <main className="px-5 pb-10 pb-safe max-w-lg mx-auto space-y-6 relative z-10">
        {/* Main Exchange Card Area */}
        <div className="space-y-2 mt-4">

          {/* FROM Input Box */}
          <div className="glass-card p-5 relative overflow-visible">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-white/50 tracking-widest uppercase">Desde:</span>
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/10 rounded-full px-3 py-1.5 shadow-inner">
                <span className="text-sm shadow-sm">{CURRENCY_INFO[baseCurrency].flag}</span>
                <span className="text-sm font-bold tracking-wide">{baseCurrency}</span>
              </div>
            </div>

            <div className="min-h-[4.5rem] flex items-center">
              <AmountInput
                value={amount}
                onChange={(val) => {
                  setAmount(val)
                  setHasConverted(false)
                }}
                currency={baseCurrency}
                disabled={isLoading}
                variant="display"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-white/40 mt-1">
              <span>Selector de moneda base</span>
            </div>

            {/* Base VES Rate Type Toggle */}
            {baseCurrency === 'VES' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setVesBaseRateType('official')
                    setHasConverted(false)
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${vesBaseRateType === 'official' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/50 hover:bg-black/40'}`}
                >
                  Tasa Oficial (BCV)
                </button>
                <button
                  onClick={() => {
                    setVesBaseRateType('market')
                    setHasConverted(false)
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${vesBaseRateType === 'market' ? 'bg-white/20 text-white' : 'bg-black/20 text-white/50 hover:bg-black/40'}`}
                >
                  Tasa Paralela
                </button>
              </div>
            )}
          </div>

          <div className="py-2">
            <CurrencySelect
              value={baseCurrency}
              onChange={(val) => {
                setBaseCurrency(val)
                setHasConverted(false)
              }}
              disabled={isLoading}
            />
          </div>

          {/* Controls: Swap Action, Refresh */}
          <div className="flex items-center justify-between px-2 pt-2">
            {/* Exchange mode toggle (Compra/Venta) styled like a sleek switch */}
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 shadow-inner">
              <button
                onClick={() => setExchangeMode('buy')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${exchangeMode === 'buy' ? 'bg-neo-blue text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
              >
                COMPRA
              </button>
              <button
                onClick={() => setExchangeMode('sell')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${exchangeMode === 'sell' ? 'bg-neo-blue text-white shadow-lg' : 'text-white/50 hover:text-white/80'}`}
              >
                VENTA
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10 bg-white/5 border border-white/10 hover:bg-neo-blue/20 hover:text-white transition-colors"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Confirm Swap Button */}
          <div className="pt-6 pb-2">
            <button
              onClick={() => setHasConverted(true)}
              disabled={!rates || isLoading}
              className="w-full py-4 rounded-2xl bg-neo-gradient text-white font-bold text-lg tracking-wide shadow-[0_4px_20px_rgba(0,102,255,0.4)] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convertir
            </button>
          </div>

        </div>

        {/* Error State */}
        {error && (
          <div className="glass-card p-4 border-destructive/50 bg-destructive/20 text-white flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Recent Results Section */}
        {hasConverted && rates && (
          <div className="pt-4">
            <div className="space-y-0">
              {sortedCurrencies.map(currency => {
                const resolvedBaseRateType = baseCurrency === 'VES' ? vesBaseRateType : 'official'

                if (currency === 'VES') {
                  // Render two cards for VES target (Official and Market)
                  const amtOfficial = rates?.rates ? convert(amount, baseCurrency, 'VES', rates.rates, exchangeMode, 'official') : null
                  const amtMarket = rates?.rates ? convert(amount, baseCurrency, 'VES', rates.rates, exchangeMode, 'market') : null

                  const rateOfficialKey = `${baseCurrency}-VES_OFFICIAL`
                  const rateMarketKey = `${baseCurrency}-VES_MARKET`

                  // Inverse logic for lookup might be needed if falling back to cross rates
                  const rateOfficial = rates?.rates?.[rateOfficialKey] || (amtOfficial ? { base: baseCurrency, quote: 'VES', value: amtOfficial / amount, provider: 'Computed', at: new Date().toISOString(), rateType: 'official' as const } : null)
                  const rateMarket = rates?.rates?.[rateMarketKey] || (amtMarket ? { base: baseCurrency, quote: 'VES', value: amtMarket / amount, provider: 'Computed', at: new Date().toISOString(), rateType: 'market' as const } : null)

                  return (
                    <div key={currency} className="space-y-0">
                      <ResultCard
                        currency={currency}
                        amount={amtOfficial || 0}
                        rate={rateOfficial}
                        isLoading={isLoading}
                        exchangeMode={exchangeMode}
                      />
                      <ResultCard
                        currency={currency}
                        amount={amtMarket || 0}
                        rate={rateMarket}
                        isLoading={isLoading}
                        exchangeMode={exchangeMode}
                      />
                    </div>
                  )
                }

                const convertedAmount = rates?.rates
                  ? convert(amount, baseCurrency, currency, rates.rates, exchangeMode, resolvedBaseRateType)
                  : null

                // For non-VES, we try exact key or reconstruct
                const prefix = baseCurrency === 'VES' ? `${baseCurrency}-${currency}_${resolvedBaseRateType.toUpperCase()}` : `${baseCurrency}-${currency}`
                const exactRate = rates?.rates?.[prefix]

                // Fallback computed rate for display if cross converted
                const rate = exactRate || (convertedAmount ? { base: baseCurrency, quote: currency, value: convertedAmount / amount, provider: 'Computed', at: new Date().toISOString() } : null)

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
      </main>

    </div>
  )
}
