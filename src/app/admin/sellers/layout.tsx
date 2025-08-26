"use client"
import AdminRoute from '@/components/auth/AdminRoute'

export default function SellersLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      {children}
    </AdminRoute>
  )
}

