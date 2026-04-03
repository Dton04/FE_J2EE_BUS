import ProfileSidebar from '@/components/profile/ProfileSidebar';
import WalletContent from '@/components/profile/WalletContent';
import Link from 'next/link';

export const metadata = {
  title: 'Ví của tôi | Vexere',
  description: 'Quản lý ví và số dư',
};

export default function WalletPage() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 w-full py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#2474E5] transition">Trang chủ</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-900">Ví của tôi</span>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Left */}
          <ProfileSidebar />

          {/* Main Content Right */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
            <WalletContent />
          </div>
        </div>
      </div>
    </main>
  );
}
