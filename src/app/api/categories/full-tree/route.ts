import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.sellpoint.pp.ua';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Category/full-tree`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category tree' },
      { status: 500 }
    );
  }
} 