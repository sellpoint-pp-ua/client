import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/AvailableFilters`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }
    if (!res.ok) {
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to fetch available filters' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    const payload = await request.json()
    const res = await fetch(`${API_BASE_URL}/api/AvailableFilters`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }
    if (!res.ok) {
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to create available filters' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    const payload = await request.json()
    const res = await fetch(`${API_BASE_URL}/api/AvailableFilters`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = text }
    if (!res.ok) {
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to update available filters' }, { status: 500 })
  }
}


