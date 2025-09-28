import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { categoryId } = await params
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/Product/get-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        categoryId: categoryId,
        include: {},
        exclude: {},
        page: page,
        pageSize: pageSize,
      }),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const payload = await response.json()
    const list = Array.isArray(payload?.products) ? payload.products : []

    const normalizedProducts = list.map((product: any) => {
      const price = Number(product?.price) || 0
      const rawDiscountPrice = Number(product?.discountPrice)
      const discountPrice = Number.isFinite(rawDiscountPrice) && rawDiscountPrice > 0 ? rawDiscountPrice : null
      const hasDiscount = Boolean(product?.hasDiscount) || (discountPrice !== null && discountPrice < price)
      const rawFinal = Number(product?.finalPrice)
      const finalPrice = Number.isFinite(rawFinal) && rawFinal > 0
        ? rawFinal
        : (hasDiscount && discountPrice !== null ? discountPrice : price)
      const discountPercentage = product?.discountPercentage ?? (hasDiscount && price > 0 ? Math.round(100 - (finalPrice / price) * 100) : null)
      return {
        id: product?.id || product?.productId || product?._id || '',
        name: product?.name || 'Без назви',
        price,
        discountPrice,
        hasDiscount,
        finalPrice,
        discountPercentage,
        quantityStatus: product?.quantityStatus,
        quantity: product?.quantity,
        productType: product?.productType,
        categoryPath: Array.isArray(product?.categoryPath) ? product.categoryPath : [],
        paymentOptions: product?.paymentOptions ?? 0,
        deliveryType: product?.deliveryType ?? 0,
      }
    })

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