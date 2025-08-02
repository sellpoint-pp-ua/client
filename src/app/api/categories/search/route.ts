import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    const languageCode = searchParams.get('languageCode') || 'uk'

    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
    }

    const response = await fetch(
      `https://api.sellpoint.pp.ua/api/Category/search?name=${encodeURIComponent(name)}&languageCode=${languageCode}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in category search:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
} 