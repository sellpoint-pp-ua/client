import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    
    
    
    const res = await fetch(`${API_BASE_URL}/api/Auth/check-login`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })

    

    if (res.status === 200) {
      
      return NextResponse.json({ success: true }, { status: 200 })
    } else if (res.status === 403) {
      
      return NextResponse.json({ error: 'User is banned' }, { status: 403 })
    } else {
      
      const errorText = await res.text()
      console.error('Server error response:', errorText)
      return NextResponse.json({ error: 'Authentication failed' }, { status: res.status })
    }
  } catch (error) {
    
    return NextResponse.json({ message: 'Failed to check auth' }, { status: 500 })
  }
}

