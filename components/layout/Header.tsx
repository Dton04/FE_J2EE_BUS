'use client';
import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Globe, HelpCircle, User, ChevronDown, Phone } from 'lucide-react';
=======
import { Globe, Headphones, User, ChevronDown } from 'lucide-react';
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
<<<<<<< HEAD
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
=======

export default function Header() {
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10
  const { isAuthenticated, userProfile, logout } = useAuthStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

<<<<<<< HEAD
  if (!mounted || pathname?.startsWith('/admin')) {
    return null;
=======
  if (!mounted) {
    return (
      <header className="bg-[#2474E5] text-white py-3 px-6 h-[64px]">
        {/* Skeleton or empty header to match height during SSR */}
      </header>
    );
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10
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
          
<<<<<<< HEAD
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 hover:bg-white/10 p-2 rounded-full transition"><Globe size={20} /></button>
            <button className="flex items-center gap-1 hover:bg-white/10 p-2 rounded-full transition"><HelpCircle size={20} /></button>
            <button className="flex items-center gap-2 font-medium bg-white text-gray-800 px-3 py-1.5 rounded-full hover:bg-gray-50 transition hidden sm:flex">
              <Phone size={16} className="text-[#2474E5] fill-[#2474E5]" />
              <span className="text-[#2474E5] font-bold">Hotline 24/7</span>
            </button>
            
            {isAuthenticated ? (
              <div className="relative group ml-1">
                <div className="flex items-center gap-1 cursor-pointer py-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8F3FF] flex items-center justify-center text-[#A6C4EE]">
                    <User size={20} className="fill-current" />
                  </div>
                  <ChevronDown size={14} className="text-white fill-white" />
                </div>
                
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-[220px] bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 text-gray-800 font-normal">
                  <Link 
                    href="/profile" 
                    className={`block px-5 py-2.5 text-[15px] hover:bg-gray-50 transition ${pathname === '/profile' ? 'text-[#2474E5] bg-gray-50' : 'hover:text-[#2474E5]'}`}
                  >
                    Thông tin tài khoản
                  </Link>
                  <Link 
                    href="/profile/orders" 
                    className={`block px-5 py-2.5 text-[15px] hover:bg-gray-50 transition ${pathname === '/profile/orders' ? 'text-[#2474E5] bg-gray-50' : 'hover:text-[#2474E5]'}`}
                  >
                    Đơn hàng của tôi
                  </Link>
                  <Link 
                    href="#" 
                    className={`block px-5 py-2.5 text-[15px] hover:bg-gray-50 transition hover:text-[#2474E5]`}
                  >
                    Trung tâm Hỗ trợ
                  </Link>
                  <button onClick={() => logout()} className="block w-full text-left px-5 py-2.5 text-[15px] hover:bg-gray-50 hover:text-[#2474E5] transition">Đăng xuất</button>
                </div>
=======
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:bg-white/10 p-2 rounded-full transition"><Globe size={18} /></button>
            <button className="flex items-center gap-1 hover:bg-white/10 p-2 rounded-full transition"><Headphones size={18} /></button>
            <button className="flex items-center gap-1 font-medium bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition hidden sm:flex">
              Hotline 24/7
            </button>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full font-medium cursor-pointer">
                <User size={18} /> {userProfile?.full_name || 'Tài khoản'}
                <button onClick={() => logout()} className="ml-2 text-xs text-gray-500 hover:text-red-500">Đăng xuất</button>
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
<<<<<<< HEAD
                className="bg-white text-black px-4 py-1.5 rounded-md font-medium hover:bg-gray-100 transition ml-2"
=======
                className="bg-white text-black px-4 py-1.5 rounded-md font-medium hover:bg-gray-100 transition"
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10
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
