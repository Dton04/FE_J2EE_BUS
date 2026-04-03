'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { authService } from '@/services/authService';

export default function StaffGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userProfile, token, hasHydrated, setUserProfile, logout } = useAuthStore();

  const role = userProfile?.role;
  const isAllowed = role === 'STAFF' || role === 'DRIVER';
  const isChecking = Boolean(token) && !userProfile;

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
          if (profile.role !== 'STAFF' && profile.role !== 'DRIVER') {
            // ADMIN bị redirect về admin dashboard
            if (profile.role === 'ADMIN') {
              router.replace('/admin');
            } else {
              router.replace('/');
            }
          }
        })
        .catch(() => {
          logout();
          router.replace('/');
        });
      return;
    }

    if (!isAllowed) {
      if (role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [userProfile, token, router, hasHydrated, role, setUserProfile, logout, isAllowed]);

  if (!hasHydrated || isChecking || !isAllowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f8] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">
          {!hasHydrated || isChecking ? 'Dang xac thuc quyen truy cap...' : 'Dang chuyen huong...'}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
