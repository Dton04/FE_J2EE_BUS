'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const promoGroups = [
  {
    title: 'Ưu đãi nổi bật',
    items: [
      { title: 'Lương về chốt deal – Giảm đến 50% vào ngày 25 hàng tháng', img: 'https://picsum.photos/seed/promo1/500/300' },
      { title: '12h – 14h Thứ 3 – Flash Sale Tưng Bừng Giảm đến 50%', img: 'https://picsum.photos/seed/promo2/500/300' },
      { title: 'Giới thiệu bạn mới – Nhận quà khủng từ Vexere', img: 'https://picsum.photos/seed/promo3/500/300' },
      { title: 'Ưu đãi VIP – Hoàn tiền lên đến 300k khi đặt vé', img: 'https://picsum.photos/seed/promo4/500/300' },
    ],
  },
  {
    title: 'Ưu đãi thanh toán online',
    items: [
      { title: 'Giảm thêm khi thanh toán online', img: 'https://picsum.photos/seed/pay1/500/300' },
      { title: 'Giảm thêm 20K khi thanh toán bằng ví ZaloPay trong khung giờ Flash Sale', img: 'https://picsum.photos/seed/pay2/500/300' },
      { title: 'Giảm đến 100K khi thanh toán bằng Thẻ Tín dụng HD SAISON', img: 'https://picsum.photos/seed/pay3/500/300' },
      { title: 'Giảm thêm khi dùng MoMo hoặc VNPay', img: 'https://picsum.photos/seed/pay4/500/300' },
    ],
  },
  {
    title: 'Ưu đãi từ đối tác khác',
    items: [
      { title: 'Giảm đến 30% khi đặt xe công nghệ MOOVTEK dành cho khách hàng của Vexere', img: 'https://picsum.photos/seed/partner1/500/300' },
      { title: 'Giảm 20% khi đặt dịch vụ GrabBike/GrabCar cho khách hàng Vexere', img: 'https://picsum.photos/seed/partner2/500/300' },
      { title: 'Giảm đến 20% khi sử dụng dịch vụ Xanh SM cho khách hàng Vexere', img: 'https://picsum.photos/seed/partner3/500/300' },
    ],
  },
];

function PromoGroup({ group }: { group: typeof promoGroups[0] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') =>
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
        <a href="#" className="text-[#2474E5] text-sm font-medium hover:underline flex items-center gap-1">
          Xem tất cả <ChevronRight size={15} />
        </a>
      </div>
      <div className="relative group/row px-4 sm:px-6">
        <button onClick={() => scroll('left')} className="absolute -left-1 top-[40%] -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 opacity-0 group-hover/row:opacity-100 transition">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {group.items.map((item, i) => (
            <a key={i} href="#" className="flex-none w-[220px] rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white group/card">
              <div className="h-[130px] overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <p className="text-gray-800 text-sm leading-snug line-clamp-2">{item.title}</p>
              </div>
            </a>
          ))}
        </div>
        <button onClick={() => scroll('right')} className="absolute -right-1 top-[40%] -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 opacity-0 group-hover/row:opacity-100 transition">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

export default function PromoSection() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto divide-y divide-gray-50">
        {promoGroups.map((group, i) => (
          <div key={i} className="py-8">
            <PromoGroup group={group} />
          </div>
        ))}
      </div>
    </div>
  );
}
