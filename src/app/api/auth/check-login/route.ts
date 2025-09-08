import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    
    console.log('Check-login API: Received request');
    console.log('Check-login API: Token present:', !!token);
    
    const res = await fetch(`${API_BASE_URL}/api/Auth/check-login`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })

    console.log('Check-login API: Server response status:', res.status);

    if (res.status === 200) {
      console.log('Check-login API: Authentication successful');
      return NextResponse.json({ success: true }, { status: 200 })
    } else if (res.status === 403) {
      console.log('Check-login API: User is banned');
      return NextResponse.json({ error: 'User is banned' }, { status: 403 })
    } else {
      console.log('Check-login API: Authentication failed');
      const errorText = await res.text()
      console.error('Server error response:', errorText)
      return NextResponse.json({ error: 'Authentication failed' }, { status: res.status })
    }
  } catch (error) {
    console.error('Check-login API: Error:', error);
    return NextResponse.json({ message: 'Failed to check auth' }, { status: 500 })
  }
}

