import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({})) as {
      login?: string
      password?: string
    }

    const form = new FormData()
    if (payload.login) form.append('Login', payload.login)
    if (payload.password) form.append('Password', payload.password)
    form.append('DeviceInfo', 'web')

    const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: 'POST',
      body: form,
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Failed to login' }, { status: 500 })
  }
}


