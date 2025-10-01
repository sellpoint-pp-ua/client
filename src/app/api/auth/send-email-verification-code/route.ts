import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    const url = new URL(request.url)
    const language = url.searchParams.get('language') || 'uk'

    const res = await fetch(`${API_BASE_URL}/api/Auth/send-email-verification-code?language=${encodeURIComponent(language)}`, {
      method: 'POST',
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
    return NextResponse.json({ message: 'Failed to send verification code' }, { status: 500 })
  }
}


