'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bus, Users, Settings, LogOut,
  Route as RouteIcon, BarChart3, ScanLine, MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userProfile } = useAuthStore();
  const role = userProfile?.role;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const allMenuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Quản lý Chuyến', href: '/admin/trips', icon: Bus, roles: ['ADMIN'] },
    { name: 'Tuyến & Giá', href: '/admin/routes', icon: RouteIcon, roles: ['ADMIN'] },
    { name: 'Bến xe', href: '/admin/stations', icon: MapPin, roles: ['ADMIN'] },
    { name: 'Xe', href: '/admin/buses', icon: Bus, roles: ['ADMIN'] },
    { name: 'Khách hàng', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Thống kê', href: '/admin/statistics', icon: BarChart3, roles: ['ADMIN'] },
    { name: 'Check-in Vé', href: '/admin/check-in', icon: ScanLine, roles: ['ADMIN', 'STAFF', 'DRIVER'] },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const menuItems = allMenuItems.filter(item =>
    !role || item.roles.includes(role)
  );

  const isStaffOrDriver = role === 'STAFF' || role === 'DRIVER';

  return (
    <aside className="w-64 bg-white text-gray-900 flex flex-col min-h-screen font-medium border-r border-gray-100 shadow-sm">
      <div className="h-16 flex items-center justify-center border-b border-gray-100">
        <Link href="/" className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-[#FFD333] text-[#2474E5] px-2 py-1 rounded-md">V</span>
          <span className="text-[#2474E5]">Admin</span>
        </Link>
      </div>

      {/* Role badge */}
      {role && (
        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${role === 'ADMIN' ? 'bg-blue-500' :
            role === 'STAFF' ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{role}</span>
        </div>
      )}

      <div className="flex-1 py-4 px-4 flex flex-col gap-1">
        {/* Divider label cho ADMIN */}
        {!isStaffOrDriver && (
          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-2 mb-2 mt-2">Quản trị hệ thống</p>
        )}

        {menuItems.filter(i => i.href !== '/admin/check-in').map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

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

        {/* Check-in - luôn tách biệt + nổi bật */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest px-2 mb-2">Vận hành</p>
          {(() => {
            const checkInItem = menuItems.find(i => i.href === '/admin/check-in');
            if (!checkInItem) return null;
            const isActive = pathname.startsWith('/admin/check-in');
            return (
              <Link
                href="/admin/check-in"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold ${isActive
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                  }`}
              >
                <ScanLine size={20} className={isActive ? 'text-white' : 'text-green-600'} />
                Check-in Vé
              </Link>
            );
          })()}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left font-bold"
        >
          <LogOut size={20} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
