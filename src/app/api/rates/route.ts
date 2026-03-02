import { NextRequest, NextResponse } from 'next/server'
import { composeRates } from '@/lib/rates/compose'
import { RatesResponseV1 } from '@/lib/rates/types'
import { singleflight } from '@/lib/utils/singleflight'

// Force dynamic rendering since we read searchParams from request.url
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // 1. Session Cache Check (Fastest path)
    if (!forceRefresh) {
      const sessionCookie = request.cookies.get('rates_session')
      if (sessionCookie?.value) {
        try {
          const sessionData = JSON.parse(sessionCookie.value) as RatesResponseV1
          const ageMs = Date.now() - new Date(sessionData.fetchedAt).getTime()

          // If session is fresh (< 2 hours), return it immediately
          if (ageMs < 2 * 60 * 60 * 1000) {
            const ageSeconds = Math.floor(ageMs / 1000)
            console.log(`[${requestId}] Serving from session cache (Age: ${ageSeconds}s)`)
            return NextResponse.json({ ...sessionData, cache: 'session', ageSeconds })
          }
        } catch (e) {
          console.warn('Failed to parse rates_session cookie', e)
        }
      }
    }

    // If force refresh, disable cache for this request
    if (forceRefresh) {
      console.log(`[${requestId}] Force refresh triggered, serving live data (Age: 0s)`)
      const { rates, errors } = await singleflight.do('rates:v1:refresh', () => composeRates(true, requestId))

      const responsePayload: RatesResponseV1 = {
        version: 1,
        fetchedAt: new Date().toISOString(),
        ageSeconds: 0,
        cache: 'live',
        rates,
        errors
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
    const { rates, errors } = await singleflight.do('rates:v1', () => composeRates(false, requestId))

    // Calculate age based on the oldest rate's 'at' timestamp, or fallback to 0
    let oldestTimestamp = Date.now()
    const rateValues = Object.values(rates)
    if (rateValues.length > 0) {
      for (const rate of rateValues) {
        const rateTime = new Date(rate.at).getTime()
        if (rateTime < oldestTimestamp) {
          oldestTimestamp = rateTime
        }
      }
    }

    const ageSeconds = Math.max(0, Math.floor((Date.now() - oldestTimestamp) / 1000))
    console.log(`[${requestId}] Serving from server cache (Age: ${ageSeconds}s)`)

    const responsePayload: RatesResponseV1 = {
      version: 1,
      fetchedAt: new Date().toISOString(),
      ageSeconds,
      cache: 'server',
      rates,
      errors
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
    console.error(`[${requestId}] Rates API error:`, error)

    const errorResponse: RatesResponseV1 = {
      version: 1,
      fetchedAt: new Date().toISOString(),
      ageSeconds: 0,
      cache: 'live',
      rates: {},
      errors: [{ provider: 'System', message: 'Failed to fetch exchange rates: ' + (error instanceof Error ? error.message : 'Unknown') }]
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
