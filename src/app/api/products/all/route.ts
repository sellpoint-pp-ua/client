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
      cache: 'no-store'
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

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({})) as {
      categoryId?: string | null,
      include?: Record<string, string>,
      exclude?: Record<string, string>,
      page?: number,
      pageSize?: number,
      language?: string,
      priceMin?: number,
      priceMax?: number,
      sort?: number,
    }

    const body = {
      categoryId: payload.categoryId ?? null,
      include: payload.include ?? {},
      exclude: payload.exclude ?? {},
      page: typeof payload.page === 'number' ? payload.page : 0,
      pageSize: typeof payload.pageSize === 'number' ? payload.pageSize : 50,
      language: payload.language ?? 'uk',
      ...(typeof payload.priceMin === 'number' ? { priceMin: payload.priceMin } : {}),
      ...(typeof payload.priceMax === 'number' ? { priceMax: payload.priceMax } : {}),
      ...(typeof payload.sort === 'number' ? { sort: payload.sort } : {}),
    }

    const response = await fetch(`${API_BASE_URL}/api/Product/get-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: response.status })
    }
    const products = await response.json()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching filtered products:', error)
    return NextResponse.json({ error: 'Failed to fetch filtered products' }, { status: 500 })
  }
}
