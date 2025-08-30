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
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([])
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    const normalizedCategories = Array.isArray(data) ? data.map((category: { id?: string; _id?: string; name?: { uk?: string; en?: string } | string; parentId?: string }) => ({
      id: category.id || category._id || '',
      name: typeof category.name === 'object' && category.name ? 
        (category.name as { uk?: string; en?: string }).uk || 'Без назви' : 
        (category.name as string) || 'Без назви',
      parentId: category.parentId || id
    })) : []

    const validCategories = normalizedCategories.filter(category => 
      category.id && category.name && category.name !== 'Без назви'
    )

    return NextResponse.json(validCategories)
  } catch (error) {
    console.error('Error fetching category children:', error)
    return NextResponse.json([])
  }
}