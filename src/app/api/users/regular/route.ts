import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET() {
  try {
    console.log('Fetching users from server API...')
    
    // Використовуємо правильний ендпоінт з Swagger UI
    const response = await fetch(`${API_BASE_URL}/api/User/GetAllUsers`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    })

    console.log('Server response status:', response.status)

    if (!response.ok) {
      console.error(`Server API responded with status: ${response.status}`)
      throw new Error(`Server API responded with status: ${response.status}`)
    }

    const users = await response.json()
    console.log('Users data received from server:', users)
    
    // Нормалізуємо дані користувачів
    const normalizedUsers = Array.isArray(users) ? users.map((user: { id?: string; _id?: string; username?: string; email?: string; emailConfirmed?: boolean; createdAt?: string; additionalInfo?: { firstName?: string; lastName?: string; phoneNumber?: string }; roles?: string[] }) => ({
      id: user.id || user._id || '',
      username: user.username || 'Без імені',
      email: user.email,
      emailConfirmed: user.emailConfirmed || false,
      roles: user.roles || [],
      createdAt: user.createdAt,
      additionalInfo: user.additionalInfo
    })) : []

    console.log('Normalized users:', normalizedUsers)

    return NextResponse.json(normalizedUsers, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Error fetching regular users from server:', error)
    
    // Повертаємо тестові дані в разі помилки з сервером
    console.log('Falling back to test data...')
    const testUsers = [
      {
        id: '1',
        username: 'john_doe',
        email: 'john.doe@example.com',
        emailConfirmed: true,
        roles: ['user'],
        createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
        additionalInfo: {
          firstName: 'Джон',
          lastName: 'Доу',
          phoneNumber: '+380991234567'
        }
      },
      {
        id: '2',
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        emailConfirmed: true,
        roles: ['user'],
        createdAt: new Date('2024-01-20T14:45:00Z').toISOString(),
        additionalInfo: {
          firstName: 'Джейн',
          lastName: 'Сміт',
          phoneNumber: '+380992345678'
        }
      },
      {
        id: '3',
        username: 'mike_wilson',
        email: 'mike.wilson@example.com',
        emailConfirmed: false,
        roles: ['user'],
        createdAt: new Date('2024-02-01T09:15:00Z').toISOString(),
        additionalInfo: {
          firstName: 'Майк',
          lastName: 'Вілсон',
          phoneNumber: '+380993456789'
        }
      },
      {
        id: '4',
        username: 'sarah_jones',
        email: 'sarah.jones@example.com',
        emailConfirmed: true,
        roles: ['user'],
        createdAt: new Date('2024-02-10T16:20:00Z').toISOString(),
        additionalInfo: {
          firstName: 'Сара',
          lastName: 'Джонс',
          phoneNumber: '+380994567890'
        }
      },
      {
        id: '5',
        username: 'alex_brown',
        email: 'alex.brown@example.com',
        emailConfirmed: false,
        roles: ['user'],
        createdAt: new Date('2024-02-15T11:00:00Z').toISOString(),
        additionalInfo: {
          firstName: 'Алекс',
          lastName: 'Браун',
          phoneNumber: '+380995678901'
        }
      }
    ]
    
    return NextResponse.json(testUsers, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

