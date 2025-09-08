import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }
    
    console.log('Test-ban API: Testing ban functionality');
    console.log('Test-ban API: Token length:', token.length);
    
    console.log('Test-ban API: Testing GetUserByMyId...');
    const userResponse = await fetch(`${API_BASE_URL}/api/User/GetUserByMyId`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })
    
    console.log('Test-ban API: GetUserByMyId status:', userResponse.status);
    
    if (userResponse.ok) {
      const userData = await userResponse.json()
      console.log('Test-ban API: User data:', userData);
      
      if (userData && userData.id) {
        // Тестуємо отримання банів
        console.log('Test-ban API: Testing GetAllByUserId for user:', userData.id);
        const bansResponse = await fetch(`${API_BASE_URL}/api/User/GetAllByUserId?userId=${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
          cache: 'no-store',
        })
        
        console.log('Test-ban API: GetAllByUserId status:', bansResponse.status);
        
        if (bansResponse.ok) {
          const bans = await bansResponse.json()
          console.log('Test-ban API: Bans data:', bans);
          console.log('Test-ban API: Bans type:', typeof bans);
          console.log('Test-ban API: Bans is array:', Array.isArray(bans));
          console.log('Test-ban API: Bans length:', Array.isArray(bans) ? bans.length : 'N/A');
          
          return NextResponse.json({
            user: userData,
            bans: bans,
            isBanned: Array.isArray(bans) && bans.length > 0,
            banCount: Array.isArray(bans) ? bans.length : 0
          })
        } else {
          const errorText = await bansResponse.text()
          console.log('Test-ban API: Bans error:', errorText);
          return NextResponse.json({
            user: userData,
            bansError: errorText,
            bansStatus: bansResponse.status
          })
        }
      } else {
        return NextResponse.json({
          error: 'No user ID in response',
          userData: userData
        })
      }
    } else {
      const errorText = await userResponse.text()
      console.log('Test-ban API: User error:', errorText);
      return NextResponse.json({
        error: 'Failed to get user info',
        status: userResponse.status,
        errorText: errorText
      })
    }
    
  } catch (error) {
    console.error('Test-ban API: Error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

