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
        'Accept': '*/*',
      },
      cache: 'no-store',
    })

    console.log('Check-login API: Server response status:', res.status);

    if (res.status === 200) {
      console.log('Check-login API: Authentication successful');
      // If successful, return a proper response
      return NextResponse.json({ success: true }, { status: 200 })
    } else {
      console.log('Check-login API: Authentication failed');
      // If not successful, return error
      return NextResponse.json({ error: 'Authentication failed' }, { status: res.status })
    }
  } catch (error) {
    console.error('Check-login API: Error:', error);
    return NextResponse.json({ message: 'Failed to check auth' }, { status: 500 })
  }
}

