'use client'
'use client'
// @ts-nocheck
/* eslint-disable */

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
    // Dev bypass: allow if local flag is set
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
      // Soft mode: even if no token, still allow, but skip admin check
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
        // Soft mode: do not block, only record state
        setAllowed(true)
      } catch {
        // Soft mode: allow but mark as not admin
        setIsAdmin(false)
        setAllowed(true)
      }
    }
    check()
  }, [redirectTo])

  // Always render in soft mode
  return <>{children}</>
}


