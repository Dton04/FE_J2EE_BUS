import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileForm from '@/components/profile/ProfileForm';
import Link from 'next/link';

export const metadata = {
  title: 'Thông tin tài khoản | Vexere',
  description: 'Quản lý thông tin cá nhân trên Vexere',
};

export default function ProfilePage() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 w-full py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#2474E5] transition">Trang chủ</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-900">Thông tin tài khoản</span>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Left */}
          <ProfileSidebar />

          {/* Main Content Right */}
          <ProfileForm />
        </div>
      </div>
    </main>
  );
}
