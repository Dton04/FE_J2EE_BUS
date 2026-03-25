'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userProfile, token, hasHydrated, setUserProfile, logout } = useAuthStore();
  const isAuthorized = Boolean(token) && Boolean(userProfile) && userProfile?.role === 'ADMIN';
  const isChecking = Boolean(token) && userProfile === null;

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!token) {
      router.replace('/');
      return;
    }

    if (!userProfile) {
      authService
        .getProfile()
        .then((profile) => {
          setUserProfile(profile);
          if (profile.role !== 'ADMIN') {
            router.replace('/');
          }
        })
        .catch(() => {
          logout();
          router.replace('/');
        });
      return;
    }

    if (userProfile && userProfile.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [userProfile, token, router, hasHydrated, setUserProfile, logout]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">
          {!hasHydrated || isChecking ? 'Đang xác thực quyền truy cập...' : 'Đang chuyển hướng...'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
