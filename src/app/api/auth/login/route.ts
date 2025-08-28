import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({})) as {
      Login?: string
      Password?: string
    }

    console.log('Login API: Received payload:', payload)

    // Try URL-encoded form data instead of FormData
    const formData = new URLSearchParams()
    formData.append('Login', payload.Login || '')
    formData.append('Password', payload.Password || '')
    formData.append('DeviceInfo', 'web')

    console.log('Login API: Sending to external API with URL-encoded data')

    const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      cache: 'no-store',
    })

    console.log('Login API: External API response status:', res.status)

    const text = await res.text()
    console.log('Login API: External API response body:', text)
    
    let data: unknown
    try { 
      data = JSON.parse(text) 
      console.log('Login API: Parsed JSON response:', data)
    } catch { 
      data = text 
      console.log('Login API: Raw text response:', text)
    }

    if (!res.ok) {
      console.log('Login API: Returning error response')
      
      // If it's a validation error, try to provide a more helpful message
      if (res.status === 400 && typeof data === 'object' && data && 'errors' in data) {
        const errors = (data as any).errors;
        if (errors && errors.Password) {
          return NextResponse.json({ 
            message: 'Пароль не відповідає вимогам системи. Спробуйте інший пароль або зверніться до адміністратора.',
            details: errors 
          }, { status: 400 })
        }
      }
      
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }
    
    console.log('Login API: Returning success response')
    if (typeof data === 'string') {
      return NextResponse.json({ token: data })
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('Login API: Error:', error)
    return NextResponse.json({ message: 'Failed to login' }, { status: 500 })
  }
}
