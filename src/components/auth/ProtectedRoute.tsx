'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BanNotification } from './BanNotification';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth/login' 
}) => {
  const { isAuthenticated, checkAuth } = useAuth();
  const router = useRouter();
  const [isBanned, setIsBanned] = useState(false);
  const [isCheckingBan, setIsCheckingBan] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
    };
    
    checkAuthentication();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  useEffect(() => {
    const checkUserBans = async () => {
      if (!isAuthenticated) return;

      try {
        setIsCheckingBan(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) return;

        const response = await fetch('/api/auth/check-login', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 403) {
          setIsBanned(true);
        }
      } catch (error) {
        console.error('Error checking user bans:', error);
      } finally {
        setIsCheckingBan(false);
      }
    };

    checkUserBans();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (isBanned) {
    return <BanNotification />;
  }

  if (isCheckingBan) {
    return (
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Перевірка статусу акаунту...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 