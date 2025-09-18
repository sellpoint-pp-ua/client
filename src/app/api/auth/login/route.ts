import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({})) as {
      Login?: string
      Password?: string
    }

    

    const formData = new URLSearchParams()
    formData.append('Login', payload.Login || '')
    formData.append('Password', payload.Password || '')
    formData.append('DeviceInfo', 'web')

    

    const res = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
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
      
      
      if (res.status === 400 && typeof data === 'object' && data && 'errors' in data) {
        const errors = (data as { errors?: Record<string, string[]> }).errors;
        if (errors && errors.Password) {
          return NextResponse.json({ 
            message: 'Пароль не відповідає вимогам системи. Спробуйте інший пароль або зверніться до адміністратора.',
            details: errors 
          }, { status: 400 })
        }
      }
      
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }
    
    
    
    if (typeof data === 'string' || (typeof data === 'object' && data && 'token' in data)) {
      const token = typeof data === 'string' ? data : (data as { token: string }).token
      
      
      
      try {
        const checkResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-ban`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: 'no-store',
        })
        
        
        
        if (checkResponse.status === 403) {
          const banData = await checkResponse.json()
          
          return NextResponse.json({ 
            message: banData.message || 'Нам шкода, але ваш акаунт було заблоковано адміністратором системи. Якщо ви вважаєте, що це помилка, зверніться до адміністратора для розблокування.',
            isBanned: true
          }, { status: 403 })
        }
        
        
        if (typeof data === 'string') {
          return NextResponse.json({ token: data })
        }
        return NextResponse.json(data)
        
      } catch (banCheckError) {
        
        
        if (typeof data === 'string') {
          return NextResponse.json({ token: data })
        }
        return NextResponse.json(data)
      }
    }
  } catch (error) {
    
    return NextResponse.json({ message: 'Failed to login' }, { status: 500 })
  }
}
