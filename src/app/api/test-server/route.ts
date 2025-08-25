import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Тестуємо різні ендпоінти серверного API, використовуючи правильні шляхи з Swagger UI
    const testEndpoints = [
      {
        url: 'https://api.sellpoint.pp.ua/api/User/GetAllUsers',
        method: 'GET'
      },
      {
        url: 'https://api.sellpoint.pp.ua/api/Category/full-tree',
        method: 'GET'
      },
      {
        url: 'https://api.sellpoint.pp.ua/api/Product/get-all',
        method: 'POST',
        body: {
          categoryId: null,
          include: {},
          exclude: {},
          page: 0,
          pageSize: 1,
          language: "uk"
        }
      }
    ]

    const results = []

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.url} (${endpoint.method})`)
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method as 'GET' | 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
        })

        const result: {
          endpoint: string
          method: string
          status: number
          statusText: string
          ok: boolean
          headers: { [key: string]: string }
          dataLength?: string | number
          sampleData?: any
          parseError?: string
        } = {
          endpoint: endpoint.url,
          method: endpoint.method,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        }

        if (response.ok) {
          try {
            const data = await response.json()
            result.dataLength = Array.isArray(data) ? data.length : 'Not an array'
            result.sampleData = Array.isArray(data) && data.length > 0 ? data[0] : null
          } catch (parseError) {
            result.parseError = 'Failed to parse response as JSON'
          }
        }

        results.push(result)
        console.log(`Endpoint ${endpoint.url} result:`, result)

      } catch (error) {
        console.error(`Error testing endpoint ${endpoint.url}:`, error)
        results.push({
          endpoint: endpoint.url,
          method: endpoint.method,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'ERROR'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Server API test completed',
      timestamp: new Date().toISOString(),
      results
    }, { status: 200 })

  } catch (error) {
    console.error('Error in server test:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to test server API',
      timestamp: new Date().toISOString()
    }, { status: 500 })
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
