import { NextRequest, NextResponse } from 'next/server'
import { composeRates } from '@/lib/rates/compose'
import { RatesResponse } from '@/lib/rates/types'

export const runtime = 'edge'
export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // If force refresh, disable cache for this request
    if (forceRefresh) {
      const rates = await composeRates()
      const providerNotes: string[] = []
      
      return NextResponse.json({
        at: new Date().toISOString(),
        providerNotes,
        rates
      } as RatesResponse, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }
    
    // Normal cached request
    const rates = await composeRates()
    const providerNotes: string[] = []
    
    return NextResponse.json({
      at: new Date().toISOString(),
      providerNotes,
      rates
    } as RatesResponse)
    
  } catch (error) {
    console.error('Rates API error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch exchange rates',
        at: new Date().toISOString(),
        providerNotes: ['All providers failed'],
        rates: {}
      },
      { status: 500 }
    )
  }
}
