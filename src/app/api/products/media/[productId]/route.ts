import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { productId } = await params

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ProductMedia/by-product-id/${productId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 } 
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([])
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const media = await response.json()
    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching product media:', error)
    return NextResponse.json([])
  }
}