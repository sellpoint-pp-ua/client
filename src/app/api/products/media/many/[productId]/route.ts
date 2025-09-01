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
    const upstreamUrl = `${API_BASE_URL}/api/ProductMedia/many?productId=${encodeURIComponent(productId)}`
    const response = await fetch(upstreamUrl, { cache: 'no-store' })
    if (!response.ok) {
      if (response.status === 404) return NextResponse.json([])
      return NextResponse.json({ error: 'Upstream error' }, { status: response.status })
    }

    const data = await response.json()
    const normalized = Array.isArray(data)
      ? data.map((item: any) => ({
          sourceUrl: item?.files?.sourceUrl || null,
          compressedUrl: item?.files?.compressedUrl || null,
          order: typeof item?.order === 'number' ? item.order : 0,
          type: Number(item?.type) === 1 ? 'video' : 'image',
        }))
      : []
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching product media (many):', error)
    return NextResponse.json([])
  }
}


