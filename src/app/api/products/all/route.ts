import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const categoryId = searchParams.get('categoryId')
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  try {
    const response = await fetch(`${API_BASE_URL}/api/Product/get-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId: categoryId === 'null' ? null : categoryId,
        include: {},
        exclude: {},
        page: page,
        pageSize: pageSize,
        language: "uk"
      }),
      next: { revalidate: 3600 } 
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const products = await response.json()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
