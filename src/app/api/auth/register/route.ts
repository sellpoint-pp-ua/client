import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({})) as {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
    }

    const form = new FormData()
    if (payload.firstName) form.append('FirstName', payload.firstName)
    if (payload.lastName) form.append('LastName', payload.lastName)
    if (payload.email) form.append('Email', payload.email)
    if (payload.password) form.append('Password', payload.password)
    form.append('DeviceInfo', 'web')

    const res = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: 'POST',
      body: form,
      headers: { 'Accept': '*/*' },
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    if (!res.ok) {
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }

    if (typeof data === 'string') {
      return NextResponse.json({ token: data })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to register' }, { status: 500 })
  }
}


