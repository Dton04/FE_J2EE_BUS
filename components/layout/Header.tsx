'use client';
import { useState, useEffect } from 'react';
import { Globe, Headphones, User, ChevronDown } from 'lucide-react';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function Header() {
  const { isAuthenticated, userProfile, logout } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // schedule setMounted to avoid synchronous state update in effect
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-[#2474E5] text-white py-3 px-6 h-[64px]">
        {/* Skeleton or empty header to match height during SSR */}
      </header>
    );
  }
  return (
    <>
      <header className="bg-[#2474E5] text-white py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2 cursor-pointer">
            <span className="bg-yellow-400 text-[#2474E5] px-2 py-1 rounded-md">V</span>
            vexere
          </Link>
          <div className="hidden md:flex text-sm opacity-90">
            Cam kết hoàn 150% nếu nhà xe<br />không cung cấp dịch vụ (*)
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="hidden lg:flex items-center gap-4 font-medium">
            <span className="cursor-pointer hover:underline">Đơn hàng của tôi</span>
            <span className="cursor-pointer hover:underline">Mở bán vé trên Vexere</span>
            <span className="cursor-pointer hover:underline flex items-center gap-1">Trở thành đối tác <ChevronDown size={14}/></span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Ngôn ngữ"
              title="Ngôn ngữ"
              className="flex items-center gap-1 hover:bg-white/10 p-2 rounded-full transition"
            >
              <Globe size={18} />
            </button>
            <button
              type="button"
              aria-label="Hỗ trợ"
              title="Hỗ trợ"
              className="flex items-center gap-1 hover:bg-white/10 p-2 rounded-full transition"
            >
              <Headphones size={18} />
            </button>
            <button className="flex items-center gap-1 font-medium bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition hidden sm:flex">
              Hotline 24/7
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full font-medium cursor-pointer">
                <User size={18} /> {typeof userProfile?.full_name === 'string' ? userProfile.full_name : 'Tài khoản'}
                <button onClick={() => logout()} className="ml-2 text-xs text-gray-500 hover:text-red-500">Đăng xuất</button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-white text-black px-4 py-1.5 rounded-md font-medium hover:bg-gray-100 transition"
              >
                Đăng nhập
              </button>
            )}
            
          </div>
        </div>
      </header>
      
      {isLoginOpen && (
        <LoginModal 
          onClose={() => setIsLoginOpen(false)} 
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }} 
        />
      )}
      {isRegisterOpen && (
        <RegisterModal 
          onClose={() => setIsRegisterOpen(false)} 
          onSwitchToLogin={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }} 
        />
      )}
    </>
  );
}
