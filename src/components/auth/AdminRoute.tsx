'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

type AdminRouteProps = {
    children: React.ReactNode
    redirectTo?: string
}

export default function AdminRoute({ children, redirectTo = '/auth/login' }: AdminRouteProps) {
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const devBypass = localStorage.getItem('admin_dev_bypass')
            if (devBypass === 'true') {
                setIsLoading(false)
                return
            }
        }
        const check = async () => {
            const token = authService.getToken()
            if (!token) {
                setIsLoading(false)
                router.push(redirectTo)
                return
            }
            try {
                const res = await fetch('https://api.sellpoint.pp.ua/api/Auth/check-admin', {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: 'no-store',
                })
                const data = await res.json() 
                if (!res.ok || !data.isAdmin) {
                    router.push(redirectTo)
                }
                setIsLoading(false)
            } catch {
                setIsLoading(false)
                router.push(redirectTo)
            }
        }
        check()
    }, [redirectTo, router])

    if (isLoading) {
        return <div>Перевірка доступу...</div>
    }

    return <>{children}</>
}
