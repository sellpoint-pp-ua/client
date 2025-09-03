import { NextResponse } from 'next/server'
import logger from '../../../../lib/logger'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'
export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const banId = url.searchParams.get('banId')

    if (!banId) {
      return NextResponse.json(
        { error: 'BanId is required' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')

    const headers: HeadersInit = {}

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/UnbanUser?banId=${banId}`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
  const errorText = await response.text()
  logger.error('Server error response:', errorText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error unbanning user:', error)
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    )
  }
}
