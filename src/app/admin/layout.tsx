"use client"
import AdminRoute from '@/components/auth/AdminRoute'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRoot = pathname === '/admin'

  return (
    <AdminRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="mx-auto max-w-[1500px] px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">← На головну</Link>
              {!isRoot && (
                <Link href="/admin" className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">↩ До адмін панелі</Link>
              )}
            </div>
            <h1 className="text-lg font-semibold text-[#4563d1]">Sell Point — Адмін панель</h1>
            <div />
          </div>
        </header>
        <main className="flex-1">
          <div className="mx-auto max-w-[1500px] px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}


