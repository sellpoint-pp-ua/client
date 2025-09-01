import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: Request) {
  try {
    // Отримуємо токен з заголовків запиту
    const authHeader = request.headers.get('authorization')

    const headers: HeadersInit = {}
    
    // Додаємо токен авторизації якщо він є
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/GetAllBans`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server error response:', errorText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const bans = await response.json()
    return NextResponse.json(bans)
  } catch (error) {
    console.error('Error fetching all bans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bans' },
      { status: 500 }
    )
  }
}
