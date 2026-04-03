import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ReviewsContent from '@/components/profile/ReviewsContent';
import Link from 'next/link';

export const metadata = {
  title: 'Đánh giá chuyến đi | Vexere',
  description: 'Xem và gửi đánh giá cho các chuyến xe đã hoàn thành trên Vexere',
};

export default function ReviewsPage() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 w-full py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 font-medium">
          <Link href="/" className="hover:text-[#2474E5] transition">Trang chủ</Link>
          <span className="mx-2">{'>'}</span>
          <Link href="/profile" className="hover:text-[#2474E5] transition">Tài khoản</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-gray-900">Đánh giá chuyến đi</span>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Left */}
          <ProfileSidebar />

          {/* Main Content Right */}
          <ReviewsContent />
        </div>
      </div>
    </main>
  );
}
