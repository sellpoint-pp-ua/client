import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  
  if (!id) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/Category/children/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Disable caching to ensure fresh data
      }
    )

    if (!response.ok) {
      // Return empty array for 404 to handle missing subcategories gracefully
      if (response.status === 404) {
        return NextResponse.json([])
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching category children:', error)
    // Return empty array instead of error to handle missing subcategories gracefully
    return NextResponse.json([])
  }
} 