"use client"
import AdminRoute from '@/components/auth/AdminRoute'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <div className="min-h-screen flex bg-gray-50">
        <div className="flex-shrink-0">
          <AdminSidebar />
        </div>
        <main className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}


