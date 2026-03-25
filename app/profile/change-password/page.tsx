import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm';
import Link from 'next/link';

export const metadata = {
  title: 'Đổi mật khẩu | Vexere',
  description: 'Thay đổi mật khẩu tài khoản của bạn trên Vexere',
};

export default function ChangePasswordPage() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 w-full py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#2474E5] transition">Trang chủ</Link>
          <span className="mx-2">{'>'}</span>
          <Link href="/profile" className="hover:text-[#2474E5] transition">Thông tin tài khoản</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-900">Đổi mật khẩu</span>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Left */}
          <ProfileSidebar />

          {/* Main Content Right */}
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  );
}
