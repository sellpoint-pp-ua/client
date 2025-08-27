import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/User/get-sellers`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const users = await response.json()
    
    // Нормалізуємо дані продавців
    const normalizedSellers = Array.isArray(users) ? users.map((user: { id?: string; _id?: string; username?: string; email?: string; emailConfirmed?: boolean; createdAt?: string; roles?: string[]; additionalInfo?: { firstName?: string; lastName?: string; phoneNumber?: string } }) => ({
      id: user.id || user._id || '',
      username: user.username || 'Без імені',
      email: user.email,
      emailConfirmed: user.emailConfirmed || false,
      createdAt: user.createdAt,
      roles: user.roles || [],
      additionalInfo: user.additionalInfo
    })) : []

    return NextResponse.json(normalizedSellers)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    )
  }
}

