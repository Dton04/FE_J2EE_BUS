'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const role = userProfile?.role;
  const isChecking = Boolean(token) && !userProfile;
  const isAuthorizedAdmin = role === 'ADMIN';
  const isAuthorizedStaffDriver = (role === 'STAFF' || role === 'DRIVER') && pathname === '/admin/check-in';
  const isAuthorized = Boolean(token) && Boolean(userProfile) && (isAuthorizedAdmin || isAuthorizedStaffDriver);

  useEffect(() => {
    if (!isMounted) return;

    if (!token) {
      router.replace('/');
      return;
    }

    if (userProfile) {
      if (role === 'STAFF' || role === 'DRIVER') {
        if (pathname !== '/admin/check-in') {
          router.replace('/admin/check-in'); // Redirect to check-in if STAFF/DRIVER visits other admin paths
        }
      } else if (role !== 'ADMIN') {
        router.replace('/'); // Any other role kicked out
      }
    }
  }, [userProfile, token, router, pathname, isMounted, role]);

  if (!isMounted || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">
          {!isMounted || isChecking ? 'Đang xác thực quyền truy cập...' : 'Đang chuyển hướng...'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
