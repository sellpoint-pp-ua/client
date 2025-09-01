import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization') || ''
    
    if (!token) {
      console.log('Check-ban API: No authorization token provided');
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }
    
    console.log('Check-ban API: Checking ban status for user');
    console.log('Check-ban API: Token length:', token.length);
    
    // Спочатку отримуємо інформацію про поточного користувача
    console.log('Check-ban API: Fetching user info from:', `${API_BASE_URL}/api/User/GetUserByMyId`);
    const userResponse = await fetch(`${API_BASE_URL}/api/User/GetUserByMyId`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })
    
    console.log('Check-ban API: User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      console.log('Check-ban API: Failed to get user info, status:', userResponse.status);
      const errorText = await userResponse.text();
      console.log('Check-ban API: User error response:', errorText);
      return NextResponse.json({ error: 'Failed to get user info' }, { status: userResponse.status })
    }
    
    const userData = await userResponse.json()
    console.log('Check-ban API: User data:', userData);
    
    if (!userData || !userData.id) {
      console.log('Check-ban API: No user ID found in user data');
      return NextResponse.json({ error: 'No user ID found' }, { status: 400 })
    }
    
    // Тепер перевіряємо банів для цього користувача
    console.log('Check-ban API: Fetching bans for user ID:', userData.id);
    console.log('Check-ban API: Bans URL:', `${API_BASE_URL}/api/User/GetAllByUserId?userId=${userData.id}`);
    
    const bansResponse = await fetch(`${API_BASE_URL}/api/User/GetAllByUserId?userId=${userData.id}`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
      cache: 'no-store',
    })
    
    console.log('Check-ban API: Bans response status:', bansResponse.status);
    
    if (bansResponse.ok) {
      const bans = await bansResponse.json()
      console.log('Check-ban API: Bans data:', bans);
      console.log('Check-ban API: Bans array length:', Array.isArray(bans) ? bans.length : 'Not an array');
      
      // Якщо є активні банів, користувач заблокований
      if (Array.isArray(bans) && bans.length > 0) {
        console.log('Check-ban API: User is banned, found', bans.length, 'bans');
        return NextResponse.json({ 
          isBanned: true,
          message: 'Нам шкода, але ваш акаунт було заблоковано адміністратором системи. Якщо ви вважаєте, що це помилка, зверніться до адміністратора для розблокування.',
          bans: bans
        }, { status: 403 })
      } else {
        console.log('Check-ban API: No bans found for user');
      }
    } else {
      console.log('Check-ban API: Failed to get bans, status:', bansResponse.status);
      const errorText = await bansResponse.text();
      console.log('Check-ban API: Bans error response:', errorText);
    }
    
    console.log('Check-ban API: User is not banned');
    return NextResponse.json({ isBanned: false }, { status: 200 })
    
  } catch (error) {
    console.error('Check-ban API: Error:', error);
    return NextResponse.json({ message: 'Failed to check ban status' }, { status: 500 })
  }
}
