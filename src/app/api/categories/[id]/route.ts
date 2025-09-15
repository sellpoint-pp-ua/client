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
    const response = await fetch(`${API_BASE_URL}/api/Category/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const c = await response.json()
    const normalized = {
      id: c?.id || '',
      name: typeof c?.name === 'string' ? c.name : '',
      parentId: typeof c?.parentId === 'string' ? c.parentId : null,
    }
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
  }

  try {
    const token = request.headers.get('authorization') || ''
    const res = await fetch(`${API_BASE_URL}/api/Category/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ message: text || 'Failed to delete' }, { status: res.status })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ message: 'Failed to delete category' }, { status: 500 })
  }
}