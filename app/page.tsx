
import SearchBanner from '../components/home/SearchBanner';

export default function Home() {
  return (
    <main className="flex-1 w-full bg-[#f2f2f2] flex flex-col">
      <SearchBanner />
      
      <div className="max-w-5xl mx-auto w-full py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tuyến đường phổ biến</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-white shadow-sm rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">Ảnh tuyến 1</div>
          <div className="h-48 bg-white shadow-sm rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">Ảnh tuyến 2</div>
          <div className="h-48 bg-white shadow-sm rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">Ảnh tuyến 3</div>
        </div>
      </div>
    </main>
  );
}
