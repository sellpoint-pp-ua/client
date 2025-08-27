import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    id: string;
  }>
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
  try {
    const res = await fetch(`${API_BASE_URL}/api/AvailableFilters/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) {
      if (res.status === 404) return NextResponse.json([])
      return NextResponse.json({ error: 'Failed to fetch filters' }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 })
  }
}


