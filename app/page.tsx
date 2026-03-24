import SearchBanner from '../components/home/SearchBanner';
import PopularRoutes from '../components/home/PopularRoutes';
import PromoSection from '../components/home/PromoSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import NewsSection from '../components/home/NewsSection';
import AppDownload from '../components/home/AppDownload';

export default function Home() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col">
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
    </main>
  );
}
