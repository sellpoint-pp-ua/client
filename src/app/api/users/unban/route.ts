import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { banId } = body

    if (!banId) {
      return NextResponse.json(
        { error: 'BanId is required' },
        { status: 400 }
      )
    }

    // Отримуємо токен з заголовків запиту
    const authHeader = request.headers.get('authorization')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Додаємо токен авторизації якщо він є
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/UnbanUser?banId=${banId}`, {
      method: 'POST',
      headers,
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unbanning user:', error)
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    )
  }
}
