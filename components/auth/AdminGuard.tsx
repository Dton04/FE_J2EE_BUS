'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userProfile, token } = useAuthStore();
  // Start as null = "checking", true = ok, false = denied
  const [authStatus, setAuthStatus] = useState<null | 'authorized' | 'denied'>(null);

  useEffect(() => {
    // Wait for Zustand persist hydration — both token and profile must be checked
    // This effect runs client-side after hydration, so store values are real
    if (!token) {
      setAuthStatus('denied');
      router.replace('/');
      return;
    }

    if (userProfile !== null) {
      if (userProfile.role === 'ADMIN') {
        setAuthStatus('authorized');
      } else {
        setAuthStatus('denied');
        router.replace('/');
      }
    }
    // If token exists but userProfile not yet in store → stay on loading
    // This handles the case where login just ran but profile hasn't propagated
  }, [userProfile, token, router]);

  // While checking, show a loading spinner
  if (authStatus !== 'authorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">Đang xác thực quyền truy cập...</p>
      </div>
    );
  }

  return <>{children}</>;
}
