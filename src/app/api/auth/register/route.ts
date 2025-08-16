import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({})) as {
      fullName?: string
      email?: string
      password?: string
    }

    const form = new FormData()
    if (payload.fullName) form.append('FullName', payload.fullName)
    if (payload.email) form.append('Email', payload.email)
    if (payload.password) form.append('Password', payload.password)

    const res = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: 'POST',
      body: form,
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to register' }, { status: 500 })
  }
}


