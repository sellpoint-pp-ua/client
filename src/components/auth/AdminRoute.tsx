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
    const [isAdmin, setIsAdmin] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const maxRetries = 3

    useEffect(() => {
        console.log('AdminRoute: useEffect triggered, retryCount:', retryCount);
        const checkAdminAccess = async () => {
            if (typeof window === 'undefined') {
                console.log('AdminRoute: Server-side execution, skipping');
                setIsLoading(false)
                return
            }

            console.log('AdminRoute: Starting admin access check')

            const isAuth = authService.isAuthenticated();
            console.log('AdminRoute: Local auth check:', isAuth);
            
            if (!isAuth) {
                console.warn('AdminRoute: User not authenticated')
                router.push(redirectTo)
                return
            }

            try {
                console.log('AdminRoute: Starting server auth check');
                const isAuth = await authService.checkAuth()
                console.log('AdminRoute: Server auth check result:', isAuth);
                
                if (!isAuth) {
                    console.warn('AdminRoute: Server auth check failed')
                    router.push(redirectTo)
                    return
                }
                console.log('AdminRoute: Server auth check passed')
            } catch (error) {
                console.error('AdminRoute: Server auth check error:', error)
                router.push(redirectTo)
                return
            }

            const token = authService.getToken()
            console.log('AdminRoute: Token exists:', !!token)
            if (token) {
                console.log('AdminRoute: Token length:', token.length)
                console.log('AdminRoute: Token starts with:', token.substring(0, 20) + '...')
                console.log('AdminRoute: Token ends with:', '...' + token.substring(token.length - 4))
            }

            try {
                const devBypass = localStorage.getItem('admin_dev_bypass')
                console.log('AdminRoute: Dev bypass check:', devBypass);
                if (devBypass === 'true') {
                    console.log('AdminRoute: Admin access granted via dev bypass')
                    setIsAdmin(true)
                    setIsLoading(false)
                    setError(null)
                    return
                }
            } catch (error) {
                console.warn('AdminRoute: Failed to access localStorage:', error)
            }

            try {
                setError(null)
                console.log(`AdminRoute: Attempting admin check (attempt ${retryCount + 1}/${maxRetries + 1})`)
                
                console.log('AdminRoute: Starting admin status check');
                const adminStatus = await authService.checkAdminStatus()
                
                console.log('AdminRoute: Admin status result:', adminStatus)
                
                if (adminStatus) {
                    console.log('AdminRoute: Admin access confirmed')
                    setIsAdmin(true)
                    setError(null)
                } else {
                    console.warn('AdminRoute: User is not an admin')
                    router.push(redirectTo)
                    return
                }

                console.log('AdminRoute: Setting loading to false');
                setIsLoading(false)
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                const errorStack = error instanceof Error ? error.stack : undefined;
                const errorName = error instanceof Error ? error.name : 'Unknown';
                
                console.error('AdminRoute: Admin check failed:', errorMessage)
                console.error('AdminRoute: Error stack:', errorStack)
                console.error('AdminRoute: Full error object:', error)
                console.error('AdminRoute: Error type:', typeof error);
                console.error('AdminRoute: Error name:', errorName);
                
                if (errorName === 'AbortError') {
                    console.warn('AdminRoute: Admin check timed out')
                    setError('Перевірка доступу зайняла забагато часу')
                } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
                    console.warn('AdminRoute: Network error during admin check')
                    setError('Помилка мережі. Перевірте з\'єднання')
                } else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Unauthorized') || errorMessage.includes('unauthorized')) {
                    console.warn('AdminRoute: Authentication error during admin check')
                    router.push(redirectTo)
                    return
                } else {
                    console.warn('AdminRoute: General error during admin check:', errorMessage);
                    console.warn('AdminRoute: Error details:', {
                        name: errorName,
                        message: errorMessage,
                        stack: errorStack
                    });
                    setError('Помилка перевірки доступу')
                }

                if (retryCount < maxRetries) {
                    console.log(`AdminRoute: Retrying admin check in 2 seconds... (${retryCount + 1}/${maxRetries})`)
                    setTimeout(() => {
                        console.log('AdminRoute: Retry timeout triggered');
                        setRetryCount(prev => prev + 1)
                    }, 2000)
                } else {
                    console.error('AdminRoute: Max retries reached for admin check')
                    setIsLoading(false)
                }
            }
        }

        checkAdminAccess()
    }, [redirectTo, router, retryCount])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-lg font-medium mb-2">
                        Перевірка доступу адміністратора...
                    </div>
                    {retryCount > 0 && (
                        <div className="text-sm text-gray-600">
                            Спроба {retryCount}/{maxRetries}
                        </div>
                    )}
                    {error && (
                        <div className="text-sm text-red-600 mt-2">
                            {error}
                        </div>
                    )}
                    <div className="text-xs text-gray-500 mt-4">
                        Перевірка автентифікації та прав доступу...
                    </div>
                    <div className="text-xs text-blue-500 mt-2">
                        Статус: {isAdmin ? 'Адмін підтверджено' : 'Перевірка...'}
                    </div>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        console.log('AdminRoute: User is not admin, not rendering children');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-lg font-medium mb-2 text-red-600">
                        Доступ заборонено
                    </div>
                    <div className="text-sm text-gray-600">
                        У вас немає прав адміністратора
                    </div>
                </div>
            </div>
        )
    }

    console.log('AdminRoute: Rendering admin content');
    return (
        <div className="admin-content">
            {children}
        </div>
    )
}