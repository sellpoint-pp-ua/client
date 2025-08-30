import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, reason, banType, expiresAt } = body

    if (!userId || !reason || !banType) {
      return NextResponse.json(
        { error: 'UserId, reason, and banType are required' },
        { status: 400 }
      )
    }

    // Отримуємо токен з заголовків запиту
    const authHeader = request.headers.get('authorization')

    const formData = new FormData()
    formData.append('UserId', userId)
    formData.append('Reason', reason)
    formData.append('BanType', banType)
    if (expiresAt) {
      formData.append('ExpiresAt', expiresAt)
    }

    const headers: HeadersInit = {}
    
    // Додаємо токен авторизації якщо він є
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/BanUser`, {
      method: 'POST',
      body: formData,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error banning user:', error)
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    )
  }
}
