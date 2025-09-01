import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

type ServerMedia = {
  files?: {
    sourceUrl?: string | null;
    compressedUrl?: string | null;
  } | null;
  type?: number | string | null;
  order?: number | null;
}

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
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([])
      }
      throw new Error(`API responded with status: ${response.status}`)
    }

    const media = await response.json()
    const normalized = Array.isArray(media)
  ? media.map((item: ServerMedia) => {
          const files = item?.files || {}
          const sourceUrl: string | null = files?.sourceUrl || null
          const compressedUrl: string | null = files?.compressedUrl || null
          const chosenUrl: string | null = (compressedUrl || sourceUrl) || null
          const secondaryUrl: string | null = (compressedUrl && sourceUrl && compressedUrl !== sourceUrl) ? sourceUrl : (sourceUrl || null)
          const isVideoByType = Number(item?.type) === 1
          const isVideoByExt = typeof sourceUrl === 'string' && /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(sourceUrl)
          const type: 'image' | 'video' = (isVideoByType || isVideoByExt) ? 'video' : 'image'
          return {
            url: chosenUrl,
            secondaryUrl: secondaryUrl,
            order: typeof item?.order === 'number' ? item.order : 0,
            type,
          }
        })
      : []
    return NextResponse.json(normalized)
  } catch (error) {
    console.error('Error fetching product media:', error)
    return NextResponse.json([])
  }
}