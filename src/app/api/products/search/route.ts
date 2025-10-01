import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')
  const categoryId = searchParams.get('categoryId')
  console.log('Product search API called with:', { name, categoryId })

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
  }

  try {
    let apiUrl: string
    let requestBody: { categoryId: string; include: Record<string, never>; exclude: Record<string, never>; page: number; pageSize: number } | undefined

    if (categoryId) {
      apiUrl = `${API_BASE_URL}/api/Product/get-all`
      requestBody = {
        categoryId: categoryId,
        include: {},
        exclude: {},
        page: 0,
        pageSize: 50,
      }
      console.log('Searching in category:', categoryId)
    } else {
      apiUrl = `${API_BASE_URL}/api/Product/search?name=${encodeURIComponent(name)}`
      console.log('Searching in all products')
    }

    console.log('API URL:', apiUrl)
    if (requestBody) {
      console.log('Request body:', requestBody)
    }

    const response = await fetch(apiUrl, {
      method: categoryId ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: categoryId ? JSON.stringify(requestBody) : undefined,
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const text = await response.text()
    let data: any = []
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = []
      }
    }
    console.log('Raw API response:', data)

    if (categoryId && Array.isArray(data)) {
      const searchTerm = name.toLowerCase()
      data = data.filter((product: { name?: string }) => 
        product.name && 
        typeof product.name === 'string' && 
        product.name.toLowerCase().includes(searchTerm)
      )
      console.log('Filtered by name:', data)
    }

    const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : []
    const normalizedData = Array.isArray(list) ? list.map((product: { id?: string; productId?: string; _id?: string; name?: string; highlighted?: string; price?: number; discountPrice?: number | null; hasDiscount?: boolean; finalPrice?: number; discountPercentage?: number | null; quantityStatus?: number | string; quantity?: number; productType?: string; categoryPath?: string[] }) => ({
      id: product?.id || product?.productId || product?._id || '',
      name: product?.name || product?.highlighted || 'Без назви',
      price: Number(product?.price) || 0,
      discountPrice: product?.discountPrice ?? null,
      hasDiscount: Boolean(product?.hasDiscount),
      finalPrice: product?.finalPrice ?? (Number(product?.price) || 0),
      discountPercentage: product?.discountPercentage ?? null,
      quantityStatus: product?.quantityStatus,
      quantity: product?.quantity,
      productType: product?.productType,
      categoryPath: Array.isArray(product?.categoryPath) ? product.categoryPath : []
    })) : []

    console.log('Normalized data:', normalizedData)

    return NextResponse.json(normalizedData)
  } catch (error) {
    console.error('Error fetching product search results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    )
  }
}