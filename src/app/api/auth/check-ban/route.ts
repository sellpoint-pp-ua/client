import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }
    
    
    
    const userResponse = await fetch(`${API_BASE_URL}/api/User/GetUserByMyId`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return NextResponse.json({ error: 'Failed to get user info' }, { status: userResponse.status })
    }
    
    const userData = await userResponse.json()
    
    if (!userData || !userData.id) {
      return NextResponse.json({ error: 'No user ID found' }, { status: 400 })
    }
    
    
    const bansResponse = await fetch(`${API_BASE_URL}/api/User/GetAllByUserId?userId=${userData.id}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })
    
    if (bansResponse.ok) {
      const bans = await bansResponse.json()
      
      if (Array.isArray(bans) && bans.length > 0) {
        return NextResponse.json({ 
          isBanned: true,
          message: 'Нам шкода, але ваш акаунт було заблоковано адміністратором системи. Якщо ви вважаєте, що це помилка, зверніться до адміністратора для розблокування.',
          bans: bans
        }, { status: 403 })
      } else {
        
      }
    } else {
      const errorText = await bansResponse.text();
      
    }
    
    return NextResponse.json({ isBanned: false }, { status: 200 })
    
  } catch (error) {
    
    return NextResponse.json({ message: 'Failed to check ban status' }, { status: 500 })
  }
}
