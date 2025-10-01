"use client"
import AdminRoute from '@/components/auth/AdminRoute'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <div className="min-h-screen flex bg-gray-50">
        <AdminSidebar />
        <main className="flex-1">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}


