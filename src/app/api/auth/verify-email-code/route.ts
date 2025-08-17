import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code') || ''

    const res = await fetch(`${API_BASE_URL}/api/Auth/verify-email-code?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Accept': '*/*',
      },
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: 'Failed to verify code' }, { status: 500 })
  }
}


