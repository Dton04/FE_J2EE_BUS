import { Suspense } from 'react';
import SearchBanner from '../../components/home/SearchBanner';
import SearchSidebar from '../../components/search/SearchSidebar';
import SearchResults from '../../components/search/SearchResults';

export const metadata = {
  title: 'Kết quả tìm kiếm | Vexere',
  description: 'Tìm và đặt vé xe khách online dễ dàng trên Vexere',
};

export default function SearchPage() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col min-h-screen pb-12">
      {/* 
        The top search banner needs a background color behind it, matching the header blue.
        In the home page it had a large hero image, but here it's typically just blue or a tight banner.
        We'll use SearchBanner as-is, but put it in a container.
      */}
      <div className="bg-[#2474E5] pt-4 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <SearchBanner />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 w-full mt-6 flex gap-6 items-start">
        <SearchSidebar />
        <Suspense fallback={<div className="text-sm text-gray-500">Đang tải kết quả...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </main>
  );
}
