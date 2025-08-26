import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET() {
  try {
    console.log('Testing connection to server API...')
    
    // Тестуємо з'єднання з сервером, використовуючи правильний ендпоінт
    const response = await fetch(`${API_BASE_URL}/api/User/GetAllUsers`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 } // Без кешування для тесту
    })

    console.log('Server response status:', response.status)
    console.log('Server response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        message: `Server responded with status: ${response.status}`,
        headers: Object.fromEntries(response.headers.entries())
      }, { status: 200 })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      status: response.status,
      message: 'Successfully connected to server API',
      dataLength: Array.isArray(data) ? data.length : 'Not an array',
      sampleData: Array.isArray(data) && data.length > 0 ? data[0] : null,
      headers: Object.fromEntries(response.headers.entries())
    }, { status: 200 })

  } catch (error) {
    console.error('Error testing connection:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to server API',
      timestamp: new Date().toISOString()
    }, { status: 200 })
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
