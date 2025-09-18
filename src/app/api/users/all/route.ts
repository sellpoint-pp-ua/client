import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

interface ApiUser {
  id?: string
  _id?: string
  username?: string
  email?: string
  emailConfirmed?: boolean
  roles?: string[]
  createdAt?: string
  avatar?: {
    url?: string
    fileName?: string
  }
  additionalInfo?: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching all users from:', `${API_BASE_URL}/api/User/GetAllUsers`)
    
    const authHeader = request.headers.get('authorization')
    
    const headers: HeadersInit = {}
    
    if (authHeader) {
      headers['Authorization'] = authHeader
      console.log('Authorization header present:', authHeader.substring(0, 20) + '...')
    } else {
      console.log('No authorization header found')
    }
    
    const response = await fetch(`${API_BASE_URL}/api/User/GetAllUsers`, {
      headers,
      next: { revalidate: 0 }
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }
      
      const errorText = await response.text()
      console.error('Server error response:', errorText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const users = await response.json()
    console.log('Fetched users count:', Array.isArray(users) ? users.length : 'Not an array')
    
    const normalizedUsers = Array.isArray(users) ? users.map((user: ApiUser) => ({
      id: user.id || user._id || '',
      username: user.username || 'Без імені',
      email: user.email,
      emailConfirmed: user.emailConfirmed || false,
      roles: user.roles || [],
      createdAt: user.createdAt,
      avatar: user.avatar,
      additionalInfo: user.additionalInfo
    })) : []

    console.log('Normalized users count:', normalizedUsers.length)
    return NextResponse.json(normalizedUsers)
  } catch (error) {
    console.error('Error fetching all users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
