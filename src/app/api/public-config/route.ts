import { NextResponse } from 'next/server'

export function GET() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
  return NextResponse.json({
    googleClientId,
    apiUrl,
  })
}
