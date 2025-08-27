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
        language: "uk"
      }),
      next: { revalidate: 3600 } 
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const products = await response.json()
    
    const normalizedProducts = Array.isArray(products) ? products.map((product: { id?: string; productId?: string; _id?: string; name?: string; price?: number; discountPrice?: number; hasDiscount?: boolean; finalPrice?: number; discountPercentage?: number; quantityStatus?: string; quantity?: number; productType?: string; categoryPath?: string[] }) => ({
      id: product.id || product.productId || product._id || '',
      name: product.name || 'Без назви',
      price: product.price || 0,
      discountPrice: product.discountPrice,
      hasDiscount: product.hasDiscount || false,
      finalPrice: product.finalPrice,
      discountPercentage: product.discountPercentage,
      quantityStatus: product.quantityStatus,
      quantity: product.quantity,
      productType: product.productType,
      categoryPath: product.categoryPath || []
    })) : []

    const validProducts = normalizedProducts.filter(product => 
      product.id && product.name && product.name !== 'Без назви'
    )

    return NextResponse.json(validProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}