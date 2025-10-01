import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId') || ''
    const commentUserId = url.searchParams.get('commentUserId') || ''
    const reaction = url.searchParams.get('reaction') || ''
    const token = request.headers.get('authorization') || ''

    if (!productId || !commentUserId || reaction === '') {
      return NextResponse.json({ message: 'Missing required params' }, { status: 400 })
    }

    const upstream = `${API_BASE_URL}/api/ProductReview/SetReactionByMyId?productId=${encodeURIComponent(productId)}&commentUserId=${encodeURIComponent(commentUserId)}&reaction=${encodeURIComponent(reaction)}`
    const res = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Accept': '*/*',
      },
      cache: 'no-store',
    })

    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ message: 'Failed to set reaction' }, { status: 500 })
  }
}


