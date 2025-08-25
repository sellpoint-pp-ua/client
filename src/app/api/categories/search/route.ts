import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const languageCode = searchParams.get('languageCode') || 'uk'

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name parameter is required and must be at least 2 characters long' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/Category/search?name=${encodeURIComponent(name)}&languageCode=${languageCode}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 } 
      }
    )

    if (!response.ok) {
      console.error(`API responded with status: ${response.status} for name: ${name}`)
      if (response.status === 404) {
        return NextResponse.json([], { status: 200 })
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Нормалізуємо дані категорій
    const normalizedCategories = Array.isArray(data) ? data.map((category: { id?: string; _id?: string; name?: { uk?: string; en?: string } | string; parentId?: string }) => ({
      id: category.id || category._id || '',
      name: {
        uk: typeof category.name === 'object' && category.name ? (category.name as { uk?: string; en?: string }).uk || 'Без назви' : (category.name as string) || 'Без назви',
        en: typeof category.name === 'object' && category.name ? (category.name as { uk?: string; en?: string }).en || 'No name' : (category.name as string) || 'No name'
      },
      parentId: category.parentId || null
    })) : []

    // Фільтруємо категорії без ID або назви
    const validCategories = normalizedCategories.filter(category => 
      category.id && category.name.uk && category.name.uk !== 'Без назви'
    )

    return NextResponse.json(validCategories)
  } catch (error) {
    console.error('Error fetching category search results:', error)
    // Повертаємо порожній масив замість помилки, щоб уникнути 404 помилок
    return NextResponse.json([], { status: 200 })
  }
}