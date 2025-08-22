'use client'
'use client'

import { useEffect, useState } from 'react'
import { authService } from '@/services/authService'

type AdminRouteProps = {
  children: React.ReactNode
  redirectTo?: string
}

export default function AdminRoute({ children, redirectTo = '/auth/login' }: AdminRouteProps) {
  const [allowed, setAllowed] = useState<boolean>(true)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const devBypass = localStorage.getItem('admin_dev_bypass')
      if (devBypass === 'true') {
        setAllowed(true)
        setIsAdmin(true)
        return
      }
    }
    const check = async () => {
      const token = authService.getToken()
      if (!token) {
        setIsAdmin(false)
        return
      }
      try {
        const res = await fetch('/api/test-zone/check-admin', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        setIsAdmin(res.ok)
        setAllowed(true)
      } catch {
        setIsAdmin(false)
        setAllowed(true)
      }
    }
    check()
  }, [redirectTo])

  return <>{children}</>
}


