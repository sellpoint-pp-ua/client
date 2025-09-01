import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    // Отримуємо токен з заголовків запиту
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const headers: HeadersInit = {
      'Authorization': authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/GetUserByMyId`, {
      headers,
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      const errorText = await response.text()
      console.error('Server error response:', errorText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const user = await response.json()
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { status: 500 }
    )
  }
}
