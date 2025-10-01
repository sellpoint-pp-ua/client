import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const response = await fetch('https://api.sellpoint.pp.ua/api/Auth/check-admin', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });


    if (response.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (response.status === 403) {
      return NextResponse.json({ isAdmin: false });
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Admin check failed' }, { status: response.status });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
