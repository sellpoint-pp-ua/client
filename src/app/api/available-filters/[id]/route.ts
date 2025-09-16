import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = 'https://api.sellpoint.pp.ua'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { id } = await ctx.params
    if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 })
    const res = await fetch(`${API_BASE_URL}/api/AvailableFilters/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const text = await res.text()
      let data: unknown
      try { data = JSON.parse(text) } catch { data = text }
      return NextResponse.json(typeof data === 'string' ? { message: data } : data as object, { status: res.status })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ message: 'Failed to delete available filters' }, { status: 500 })
  }
}


