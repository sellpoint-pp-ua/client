import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const languageCode = searchParams.get('languageCode') || 'uk'

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/Category/search?name=${encodeURIComponent(name)}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const normalized = Array.isArray(data)
      ? data
          .map((c: { id?: string; name?: string; parentId?: string | null }) => ({
            id: c?.id || '',
            name: typeof c?.name === 'string' ? c.name : '',
            parentId: typeof c?.parentId === 'string' ? c.parentId : null,
          }))
          .filter((c) => c.id && c.name)
      : []
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching category search results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
}