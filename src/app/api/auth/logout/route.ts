import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    const res = await fetch(`${API_BASE_URL}/api/Auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': '*/*',
      },
      cache: 'no-store',
    })

    if (res.status === 204) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    if (res.ok) {
      const text = await res.text().catch(() => '')
      if (!text) return NextResponse.json({ success: true }, { status: 200 })
      try {
        const data = JSON.parse(text) as object
        return NextResponse.json(data, { status: 200 })
      } catch {
        return NextResponse.json({ success: true, message: text }, { status: 200 })
      }
    }

    const errorText = await res.text().catch(() => '')
    try {
      const errorJson = JSON.parse(errorText) as object
      return NextResponse.json(errorJson, { status: res.status })
    } catch {
      return NextResponse.json({ message: errorText || 'Logout failed' }, { status: res.status })
    }
  } catch {
    return NextResponse.json({ message: 'Failed to logout' }, { status: 500 })
  }
}


