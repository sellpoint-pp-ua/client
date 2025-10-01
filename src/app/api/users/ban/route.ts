import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const userId = formData.get('UserId')?.toString()
    const reason = formData.get('Reason')?.toString()

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'UserId and reason are required' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')

    const requestFormData = new FormData()
    requestFormData.append('UserId', userId)
    requestFormData.append('Reason', reason)
    requestFormData.append('Types', '8') // Login ban

    const headers: HeadersInit = {}
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_BASE_URL}/api/User/BanUser`, {
      method: 'POST',
      body: requestFormData,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server error response:', errorText)
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
