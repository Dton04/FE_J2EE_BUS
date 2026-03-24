'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bus, Users, Settings, LogOut } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Chuyến', href: '/admin/trips', icon: Bus },
    { name: 'Khách hàng', href: '/admin/users', icon: Users },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white text-gray-900 flex flex-col min-h-screen font-medium border-r border-gray-100 shadow-sm">
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-[#FFD333] text-[#2474E5] px-2 py-1 rounded-md">V</span>
          <span className="text-[#2474E5]">Admin</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-[#2474E5] text-white shadow-sm font-bold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#2474E5]'
                }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left font-bold">
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
