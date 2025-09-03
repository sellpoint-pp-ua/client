import { NextRequest, NextResponse } from 'next/server'
import logger from '../../../../lib/logger'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }
  try {
    const upstreamUrl = `${API_BASE_URL}/api/User/GetUserById?userId=${encodeURIComponent(id)}`
    const response = await fetch(upstreamUrl, { cache: 'no-store' })
    if (!response.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: response.status })
    }
    const text = await response.text()
    if (!text) {
      return NextResponse.json({ id, username: 'Користувач', avatar: null })
    }
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
    const normalized = {
      id: data?.id || id,
      username: typeof data?.username === 'string' ? data.username : 'Користувач',
      avatarUrl: data?.avatar?.compressedUrl || data?.avatar?.sourceUrl || null,
    }
    return NextResponse.json(normalized)
  } catch (error) {
    logger.error('Error fetching user by id:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}


