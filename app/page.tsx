import SearchBanner from '../components/home/SearchBanner';
<<<<<<< HEAD
import PopularRoutes from '../components/home/PopularRoutes';
import PromoSection from '../components/home/PromoSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import NewsSection from '../components/home/NewsSection';
import AppDownload from '../components/home/AppDownload';
=======
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10

export default function Home() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col">
<<<<<<< HEAD
      {/* Hero: Search Banner */}
      <SearchBanner />

      {/* Popular Routes Section */}
      <div className="bg-[#f5f8ff]">
        <PopularRoutes />
      </div>

      {/* Promotions Section */}
      <PromoSection />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* News & Tips */}
      <NewsSection />

      {/* App Download CTA */}
      <AppDownload />
=======
      <SearchBanner />
      
      <div className="max-w-5xl mx-auto w-full py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tuyến đường phổ biến</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-white shadow-sm rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">Ảnh tuyến 1</div>
          <div className="h-48 bg-white shadow-sm rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">Ảnh tuyến 2</div>
          <div className="h-48 bg-white shadow-sm rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">Ảnh tuyến 3</div>
        </div>
      </div>
>>>>>>> ab8700975eb2328c3c701be26a38718b83b5cc10
    </main>
  );
}
