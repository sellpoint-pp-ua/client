import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.sellpoint.pp.ua';

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Category/full-tree`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (response.status === 204) {
      return NextResponse.json([], { status: 200 })
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const mapNode = (n: { id?: string; name?: string; children?: unknown[] }): { id: string; name: string; children: any[] } => ({
      id: n?.id || '',
      name: typeof n?.name === 'string' ? n.name : '',
      children: Array.isArray(n?.children) ? (n!.children as Array<any>).map(mapNode).filter((x) => x.id && x.name) : [],
    });
    const normalized = Array.isArray(data) ? data.map(mapNode).filter((x) => x.id && x.name) : []
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category tree' },
      { status: 500 }
    );
  }
}