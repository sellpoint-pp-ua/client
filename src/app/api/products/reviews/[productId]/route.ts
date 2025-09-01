import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    productId: string
  }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { productId } = await params
  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
  }

  try {
    const upstreamUrl = `${API_BASE_URL}/api/ProductReview/GetAllReviews?productId=${encodeURIComponent(productId)}`
    const response = await fetch(upstreamUrl, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: response.status })
    }
    const text = await response.text()
    if (!text) {
      return NextResponse.json({ id: '', productId, rating: { oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 }, averageRating: 0, comments: [] })
    }
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ id: '', productId, rating: { oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 }, averageRating: 0, comments: [] })
    }

    const normalized = {
      id: data?.id || '',
      productId: data?.productId || productId,
      rating: {
        oneStar: Number(data?.rating?.oneStar) || 0,
        twoStar: Number(data?.rating?.twoStar) || 0,
        threeStar: Number(data?.rating?.threeStar) || 0,
        fourStar: Number(data?.rating?.fourStar) || 0,
        fiveStar: Number(data?.rating?.fiveStar) || 0,
      },
      averageRating: Number(data?.averageRating) || 0,
      comments: Array.isArray(data?.comments) ? data.comments.map((c: any) => ({
        rating: Number(c?.rating) || 0,
        userId: String(c?.userId || ''),
        comment: typeof c?.comment === 'string' ? c.comment : '',
        createdAt: typeof c?.createdAt === 'string' ? c.createdAt : '',
        positiveCount: Number(c?.positiveCount) || 0,
        negativeCount: Number(c?.negativeCount) || 0,
      })) : [],
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch product reviews' }, { status: 500 })
  }
}


