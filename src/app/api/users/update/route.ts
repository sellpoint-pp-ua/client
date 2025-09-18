import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const incoming = await request.formData()

    const forward = new FormData()

    const appendIfPresent = (key: string) => {
      const v = incoming.get(key)
      if (v !== null && v !== undefined && v !== '') {
        forward.append(key, v as any)
      }
    }

    appendIfPresent('Username')
    appendIfPresent('FullName')
    appendIfPresent('Gender')
    appendIfPresent('DateOfBirth')

    const avatar = incoming.get('Avatar')
    if (avatar instanceof File) {
      forward.append('Avatar', avatar)
    }

    const response = await fetch(`${API_BASE_URL}/api/User/UpdateUser`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
      } as HeadersInit,
      body: forward,
      cache: 'no-store',
    })

    if (response.status === 204) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const text = await response.text().catch(() => '')
    if (response.ok) {
      if (!text || text.trim().length === 0) {
        return NextResponse.json({ success: true }, { status: 200 })
      }
      try {
        const json = JSON.parse(text) as object
        return NextResponse.json(json, { status: 200 })
      } catch {
        return NextResponse.json({ success: true, message: text }, { status: 200 })
      }
    }

    try {
      const json = text ? (JSON.parse(text) as object) : { message: 'Update failed' }
      return NextResponse.json(json, { status: response.status })
    } catch {
      return NextResponse.json({ message: text || 'Update failed' }, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}


