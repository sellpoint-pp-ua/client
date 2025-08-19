import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.sellpoint.pp.ua';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Category/full-tree`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } 
    });

    if (response.status === 204) {
      return NextResponse.json([], { status: 200 })
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    let data: unknown
    try {
      data = await response.json();
    } catch {
      data = []
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category tree' },
      { status: 500 }
    );
  }
}