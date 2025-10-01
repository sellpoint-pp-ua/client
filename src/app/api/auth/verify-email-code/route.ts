import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    const { searchParams } = new URL(request.url)
    const code = (searchParams.get('code') || '').replace(/\s+/g, '').toUpperCase()

    const res = await fetch(`${API_BASE_URL}/api/Auth/verify-email-code?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': '*/*',
      },
      cache: 'no-store',
    })

    if (res.status === 400) {
      const me = await fetch(`${API_BASE_URL}/api/User/GetUserByMyId`, {
        method: 'GET',
        headers: { 'Authorization': token },
        cache: 'no-store',
      }).catch(() => null as any)
      if (me && me.ok) {
        const meJson = await me.json().catch(() => ({}))
        if (meJson && meJson.emailConfirmed === true) {
          return NextResponse.json({ success: true, alreadyVerified: true }, { status: 200 })
        }
      }
    }

    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    return NextResponse.json(data as object, { status: res.status })
  } catch {
    return NextResponse.json({ message: 'Failed to verify code' }, { status: 500 })
  }
}


