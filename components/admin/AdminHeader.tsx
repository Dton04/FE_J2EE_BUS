'use client';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function AdminHeader() {
  const { userProfile } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 max-w-sm w-full bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent outline-none w-full text-sm placeholder-gray-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-800">{userProfile?.full_name || 'Admin User'}</div>
            <div className="text-xs text-blue-600 font-medium">Administrator</div>
          </div>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
}
