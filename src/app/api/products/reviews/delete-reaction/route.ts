import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId') || ''
    const commentUserId = url.searchParams.get('commentUserId') || ''
    const token = request.headers.get('authorization') || ''

    if (!productId || !commentUserId) {
      return NextResponse.json({ message: 'Missing required params' }, { status: 400 })
    }

    const upstream = `${API_BASE_URL}/api/ProductReview/DeleteReactionByMyId?productId=${encodeURIComponent(productId)}&commentUserId=${encodeURIComponent(commentUserId)}`
    const res = await fetch(upstream, {
      method: 'DELETE',
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
    return NextResponse.json({ message: 'Failed to delete reaction' }, { status: 500 })
  }
}


