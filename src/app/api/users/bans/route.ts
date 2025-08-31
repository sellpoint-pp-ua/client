import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

interface ApiBan {
  id?: string
  _id?: string
  userId?: string
  adminId?: string
  reason?: string
  bannedAt?: string
  bannedUntil?: string
  types?: string
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      )
    }

    // Отримуємо токен з заголовків запиту
    const authHeader = request.headers.get('authorization')
    
    const headers: HeadersInit = {}
    
    // Додаємо токен авторизації якщо він є
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/GetAllByUserId?userId=${userId}`, {
      headers,
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json([])
      }
      const errorText = await response.text()
      console.error('Server error response:', errorText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const bans = await response.json()
    
    const normalizedBans = Array.isArray(bans) ? bans.map((ban: ApiBan) => ({
      id: ban.id || ban._id || '',
      userId: ban.userId,
      adminId: ban.adminId,
      reason: ban.reason,
      bannedAt: ban.bannedAt
    })) : []

    return NextResponse.json(normalizedBans)
  } catch (error) {
    console.error('Error fetching user bans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user bans' },
      { status: 500 }
    )
  }
}
