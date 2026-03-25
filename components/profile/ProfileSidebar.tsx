'use client';
import { 
  UserCircle, Star, FileText, Tag, Gift, CreditCard, 
  Edit3, HelpCircle, MessageSquare, Briefcase, LogOut, Lock
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProfileSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { id: 'account', label: 'Thông tin tài khoản', icon: UserCircle, href: '/profile' },
    { id: 'rewards', label: 'Điểm thưởng của tôi', icon: Star, href: '#' },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: FileText, href: '/profile/orders' },
    { id: 'offers', label: 'Ưu đãi', icon: Tag, href: '#' },
    { id: 'referral', label: 'Giới thiệu nhận quà', icon: Gift, badge: 'Mới', href: '#' },
    { id: 'cards', label: 'Quản lý thẻ', icon: CreditCard, href: '#' },
    { id: 'reviews', label: 'Đánh giá chuyến đi', icon: Edit3, href: '#' },
    { id: 'support', label: 'Trung tâm Hỗ trợ', icon: HelpCircle, badge: 'Mới', href: '#' },
    { id: 'feedback', label: 'Góp ý', icon: MessageSquare, href: '#' },
    { id: 'careers', label: 'Vexere tuyển dụng', icon: Briefcase, href: '#' },
    { id: 'change-password', label: 'Đổi mật khẩu', icon: Lock, href: '/profile/change-password' },
    { id: 'logout', label: 'Đăng xuất', icon: LogOut, href: '#' },
  ];

  return (
    <aside className="w-full lg:w-[280px] flex-none bg-white rounded-xl shadow-sm overflow-hidden sticky top-4 self-start">
      <div className="flex flex-col py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3.5 transition-colors border-l-4 text-left ${
                isActive
                  ? 'border-[#2474E5] bg-blue-50/50'
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <Icon 
                size={20} 
                className={isActive ? 'text-[#2474E5]' : 'text-[#2474E5]'} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-[15px] flex-1 ${
                  isActive ? 'font-semibold text-[#2474E5]' : 'font-medium text-gray-700'
                }`}
              >
                {item.label}
              </span>
              
              {item.badge && (
                <span className="bg-[#FF4D4F] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
