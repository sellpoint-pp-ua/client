import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    console.log('Check-admin API: Received request');
    console.log('Check-admin API: Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('Check-admin API: No authorization header');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    console.log('Check-admin API: Making request to server');
    const response = await fetch('https://api.sellpoint.pp.ua/api/Auth/check-admin', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('Check-admin API: Server response status:', response.status);

    if (response.status === 401) {
      console.log('Check-admin API: Unauthorized from server');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (response.status === 403) {
      console.log('Check-admin API: Forbidden - user is not admin');
      return NextResponse.json({ isAdmin: false });
    }

    if (!response.ok) {
      console.log('Check-admin API: Server error:', response.status);
      return NextResponse.json({ error: 'Admin check failed' }, { status: response.status });
    }

    console.log('Check-admin API: Admin check successful');
    // Return success response with isAdmin flag
    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Check-admin API: Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
