import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  const providers = {
    bcv: !!process.env.BCV_ENDPOINT || true, // BCV has fallback
    frankfurter: true, // No API key required
    publicFx: !!process.env.PUBLIC_FX_API_KEY || true // Has no-key fallback
  }
  
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    providers,
    environment: process.env.NODE_ENV || 'development'
  })
}
