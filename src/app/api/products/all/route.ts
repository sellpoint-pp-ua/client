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
      }),
      cache: 'no-store'
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const text = await response.text()
    if (!text) {
      return NextResponse.json({ priceFrom: 0, priceTo: 0, pages: 0, count: 0, products: [] })
    }

    let payload: any
    try {
      payload = JSON.parse(text)
    } catch {
      return NextResponse.json({ priceFrom: 0, priceTo: 0, pages: 0, count: 0, products: [] })
    }

    const list = Array.isArray(payload?.products) ? payload.products : []
    const normalizedProducts = list.map((product: any) => ({
      id: product?.id || product?.productId || product?._id || '',
      name: product?.name || 'Без назви',
      price: Number(product?.price) || 0,
      discountPrice: product?.discountPrice ?? null,
      hasDiscount: Boolean(product?.hasDiscount),
      finalPrice: (product?.finalPrice ?? (Number(product?.price) || 0)),
      discountPercentage: product?.discountPercentage ?? null,
      quantityStatus: product?.quantityStatus,
      quantity: product?.quantity,
      productType: product?.productType,
      categoryPath: Array.isArray(product?.categoryPath) ? product.categoryPath : [],
      paymentOptions: product?.paymentOptions ?? 0,
      deliveryType: product?.deliveryType ?? 0,
    }))

    const validProducts = normalizedProducts.filter((p: { id?: string; name?: string }) => p.id && p.name && p.name !== 'Без назви')

    const meta = {
      priceFrom: Number(payload?.priceFrom) || 0,
      priceTo: Number(payload?.priceTo) || 0,
      pages: Number(payload?.pages) || 0,
      count: Number(payload?.count) || validProducts.length,
    }

    return NextResponse.json({ ...meta, products: validProducts })
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

    const text = await response.text()
    if (!text) {
      return NextResponse.json({ priceFrom: 0, priceTo: 0, pages: 0, count: 0, products: [] })
    }

    let payloadJson: any
    try {
      payloadJson = JSON.parse(text)
    } catch {
      return NextResponse.json({ priceFrom: 0, priceTo: 0, pages: 0, count: 0, products: [] })
    }

    const list = Array.isArray(payloadJson?.products) ? payloadJson.products : []
    const normalizedProducts = list.map((product: any) => ({
      id: product?.id || product?.productId || product?._id || '',
      name: product?.name || 'Без назви',
      price: Number(product?.price) || 0,
      discountPrice: product?.discountPrice ?? null,
      hasDiscount: Boolean(product?.hasDiscount),
      finalPrice: (product?.finalPrice ?? (Number(product?.price) || 0)),
      discountPercentage: product?.discountPercentage ?? null,
      quantityStatus: product?.quantityStatus,
      quantity: product?.quantity,
      productType: product?.productType,
      categoryPath: Array.isArray(product?.categoryPath) ? product.categoryPath : [],
      paymentOptions: product?.paymentOptions ?? 0,
      deliveryType: product?.deliveryType ?? 0,
    }))

    const validProducts = normalizedProducts.filter((p: { id?: string; name?: string }) => p.id && p.name && p.name !== 'Без назви')

    const meta = {
      priceFrom: Number(payloadJson?.priceFrom) || 0,
      priceTo: Number(payloadJson?.priceTo) || 0,
      pages: Number(payloadJson?.pages) || 0,
      count: Number(payloadJson?.count) || validProducts.length,
    }

    return NextResponse.json({ ...meta, products: validProducts })
  } catch (error) {
    console.error('Error fetching filtered products:', error)
    return NextResponse.json({ error: 'Failed to fetch filtered products' }, { status: 500 })
  }
}
