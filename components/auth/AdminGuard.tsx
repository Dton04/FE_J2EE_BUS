'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, token, hasHydrated, setUserProfile, logout } = useAuthStore();

  const role = userProfile?.role;
  const isChecking = Boolean(token) && !userProfile;
  const isAuthorizedAdmin = role === 'ADMIN';
  const isAuthorizedStaffDriver = (role === 'STAFF' || role === 'DRIVER') && pathname === '/admin/check-in';
  const isAuthorized = Boolean(token) && Boolean(userProfile) && (isAuthorizedAdmin || isAuthorizedStaffDriver);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token) {
      router.replace('/');
      return;
    }

    if (!userProfile) {
      authService
        .getProfile()
        .then((profile) => {
          setUserProfile(profile);
          if (profile.role === 'STAFF' || profile.role === 'DRIVER') {
            if (pathname !== '/admin/check-in') {
              router.replace('/admin/check-in');
            }
          } else if (profile.role !== 'ADMIN') {
            router.replace('/');
          }
        })
        .catch(() => {
          logout();
          router.replace('/');
        });
      return;
    }

    if (role === 'STAFF' || role === 'DRIVER') {
      if (pathname !== '/admin/check-in') {
        router.replace('/admin/check-in');
      }
    } else if (role !== 'ADMIN') {
      router.replace('/');
    }
  }, [userProfile, token, router, pathname, hasHydrated, role, setUserProfile, logout]);

  if (!hasHydrated || !isAuthorized) {
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
