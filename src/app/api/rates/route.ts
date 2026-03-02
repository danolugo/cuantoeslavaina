import { NextRequest, NextResponse } from 'next/server'
import { composeRates } from '@/lib/rates/compose'
import { RatesResponse } from '@/lib/rates/types'
import { singleflight } from '@/lib/utils/singleflight'

// Force dynamic rendering since we read searchParams from request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // 1. Session Cache Check (Fastest path)
    if (!forceRefresh) {
      const sessionCookie = request.cookies.get('rates_session')
      if (sessionCookie?.value) {
        try {
          const sessionData = JSON.parse(sessionCookie.value) as RatesResponse
          const ageMs = Date.now() - new Date(sessionData.at).getTime()

          // If session is fresh (< 2 hours), return it immediately
          if (ageMs < 2 * 60 * 60 * 1000) {
            sessionData.providerNotes.push('Loaded from Session Cookie')
            return NextResponse.json(sessionData)
          }
        } catch (e) {
          console.warn('Failed to parse rates_session cookie', e)
        }
      }
    }

    // If force refresh, disable cache for this request
    if (forceRefresh) {
      const rates = await singleflight.do('rates:v1:refresh', () => composeRates(true))
      const providerNotes: string[] = []

      const responsePayload: RatesResponse = {
        at: new Date().toISOString(),
        providerNotes,
        rates
      }

      const response = NextResponse.json(responsePayload, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

      // Set the session cookie with a 2-hour Max-Age
      response.cookies.set({
        name: 'rates_session',
        value: JSON.stringify(responsePayload),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7200, // 2 hours
        path: '/'
      })

      return response
    }

    // Normal cached request
    const rates = await singleflight.do('rates:v1', () => composeRates(false))
    const providerNotes: string[] = []

    const responsePayload: RatesResponse = {
      at: new Date().toISOString(),
      providerNotes,
      rates
    }

    const response = NextResponse.json(responsePayload)

    // Set the session cookie with a 2-hour Max-Age
    response.cookies.set({
      name: 'rates_session',
      value: JSON.stringify(responsePayload),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7200, // 2 hours
      path: '/'
    })

    return response

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
