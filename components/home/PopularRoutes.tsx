'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

// Using picsum.photos with fixed seeds for stable, always-loading images
const routes = [
  { from: 'Sài Gòn', to: 'Nha Trang', price: '234.000đ', originalPrice: '280.000đ', img: 'https://picsum.photos/seed/nhatrang/400/240', duration: '~8 tiếng', badge: 'HOT' },
  { from: 'Hà Nội', to: 'Hải Phòng', price: '110.000đ', originalPrice: '', img: 'https://picsum.photos/seed/haiphong/400/240', duration: '~2 tiếng', badge: '' },
  { from: 'Sài Gòn', to: 'Phan Thiết', price: '180.000đ', originalPrice: '', img: 'https://picsum.photos/seed/phanthiet/400/240', duration: '~4 tiếng', badge: 'HOT' },
  { from: 'Sài Gòn', to: 'Phan Rang', price: '200.000đ', originalPrice: '', img: 'https://picsum.photos/seed/phanrang/400/240', duration: '~5 tiếng', badge: '' },
  { from: 'Hà Nội', to: 'Đà Nẵng', price: '350.000đ', originalPrice: '420.000đ', img: 'https://picsum.photos/seed/danang/400/240', duration: '~14 tiếng', badge: 'GIẢM GIÁ' },
  { from: 'Sài Gòn', to: 'Đà Lạt', price: '160.000đ', originalPrice: '', img: 'https://picsum.photos/seed/dalat/400/240', duration: '~7 tiếng', badge: '' },
  { from: 'Sài Gòn', to: 'Vũng Tàu', price: '90.000đ', originalPrice: '120.000đ', img: 'https://picsum.photos/seed/vungtau/400/240', duration: '~2 tiếng', badge: 'PHỔ BIẾN' },
];

export default function PopularRoutes() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    setCanLeft(scrollRef.current.scrollLeft > 0);
    setCanRight(scrollRef.current.scrollLeft + scrollRef.current.clientWidth < scrollRef.current.scrollWidth - 1);
  };

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Tuyến đường phổ biến</h2>
          <a href="#" className="text-[#2474E5] text-sm font-medium hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={15} />
          </a>
        </div>

        <div className="relative">
          {canLeft && (
            <button title="Cuộn sang trái" aria-label="Cuộn sang trái" onClick={() => scroll('left')} className="absolute -left-3 top-[45%] -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 hover:shadow-lg transition">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          )}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="hide-scrollbar flex gap-3 overflow-x-auto"
          >
            {routes.map((r, i) => (
              <a key={i} href="#" className="flex-none w-[185px] rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white group">
                <div className="relative h-[120px] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.img} alt={`${r.from} - ${r.to}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {r.badge && (
                    <span className="absolute top-2 left-2 bg-[#ff6b00] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      {r.badge}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{r.from} – {r.to}</p>
                  <p className="text-[#2474E5] font-semibold text-sm mt-1">
                    Từ {r.price}
                    {r.originalPrice && <span className="text-gray-400 text-xs font-normal line-through ml-1">{r.originalPrice}</span>}
                  </p>
                </div>
              </a>
            ))}
          </div>
          {canRight && (
            <button title="Cuộn sang phải" aria-label="Cuộn sang phải" onClick={() => scroll('right')} className="absolute -right-3 top-[45%] -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 hover:shadow-lg transition">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
