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
    const response = await fetch(`${API_BASE_URL}/api/Category/children/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([])
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const normalized = Array.isArray(data)
      ? data
          .map((c: { id?: string; name?: string; parentId?: string }) => ({
            id: c?.id || '',
            name: typeof c?.name === 'string' ? c.name : '',
            parentId: typeof c?.parentId === 'string' ? c.parentId : id,
          }))
          .filter((c) => c.id && c.name)
      : []
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching category children:', error)
    return NextResponse.json([])
  }
}