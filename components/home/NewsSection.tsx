'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

const newsSections = [
  {
    title: 'Vexere có gì mới?',
    items: [
      { title: 'Bồi thường đến 400 triệu đồng với bảo hiểm du lịch và trễ hủy chuyến tàu tại Vexere', img: 'https://picsum.photos/seed/news1/500/300', tag: 'Bảo hiểm', tagCls: 'bg-blue-100 text-blue-700' },
      { title: 'Tăng thu nhập không giới hạn với Vexere Affiliate', img: 'https://picsum.photos/seed/news2/500/300', tag: 'Affiliate', tagCls: 'bg-purple-100 text-purple-700' },
      { title: 'Vexere chính thức ra mắt dịch vụ đặt vé tàu hỏa nhanh chóng, dễ dàng', img: 'https://picsum.photos/seed/news3/500/300', tag: 'Tàu hỏa', tagCls: 'bg-green-100 text-green-700' },
      { title: 'Theo dõi hành trình xe khách thời gian thực trên ứng dụng Vexere', img: 'https://picsum.photos/seed/news4/500/300', tag: 'Tính năng', tagCls: 'bg-orange-100 text-orange-700' },
    ],
  },
  {
    title: 'Tính năng mới',
    items: [
      { title: 'Theo dõi hành trình để không lỡ chuyến – Dùng thử ngay App Vexere', img: 'https://picsum.photos/seed/feat1/500/300', tag: 'GPS', tagCls: 'bg-cyan-100 text-cyan-700' },
      { title: 'Các tuyến đường/nhà xe có hỗ trợ tính năng xem vị trí xe', img: 'https://picsum.photos/seed/feat2/500/300', tag: 'Bản đồ', tagCls: 'bg-teal-100 text-teal-700' },
      { title: 'Bí kíp chọn xe khách chất lượng cao tại Vexere', img: 'https://picsum.photos/seed/feat3/500/300', tag: 'Mẹo hay', tagCls: 'bg-yellow-100 text-yellow-700' },
      { title: 'Cách sử dụng voucher và mã giảm giá khi đặt vé trên Vexere', img: 'https://picsum.photos/seed/feat4/500/300', tag: 'Hướng dẫn', tagCls: 'bg-pink-100 text-pink-700' },
    ],
  },
  {
    title: 'Tin tức',
    items: [
      { title: 'Chương trình tích điểm đổi quà tại Vexere – Thay đổi thời hạn điểm thưởng', img: 'https://picsum.photos/seed/tn1/500/300', tag: 'Tích điểm', tagCls: 'bg-pink-100 text-pink-700' },
      { title: '[Phóng sự HTV9] Vexere và công cuộc cách mạng hoá ngành vận tải hành khách', img: 'https://picsum.photos/seed/tn2/500/300', tag: 'Báo chí', tagCls: 'bg-red-100 text-red-700' },
      { title: '[Phóng sự VTV9] Đặt dịch vụ xe khách nhanh chóng, tiện lợi tại Vexere', img: 'https://picsum.photos/seed/tn3/500/300', tag: 'Báo chí', tagCls: 'bg-red-100 text-red-700' },
      { title: 'Vexere 11 năm đồng hành cùng hàng triệu hành khách Việt', img: 'https://picsum.photos/seed/tn4/500/300', tag: 'Sự kiện', tagCls: 'bg-indigo-100 text-indigo-700' },
    ],
  },
];

function NewsGroup({ group }: { group: typeof newsSections[0] }) {
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
        <button title="Cuộn sang trái" aria-label="Cuộn sang trái" onClick={() => scroll('left')} className="absolute -left-1 top-[38%] -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 opacity-0 group-hover/row:opacity-100 transition">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <div ref={scrollRef} className="hide-scrollbar flex gap-3 overflow-x-auto">
          {group.items.map((item, i) => (
            <a key={i} href="#" className="flex-none w-[210px] rounded-xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 bg-white group/card">
              <div className="h-[120px] overflow-hidden bg-gray-50 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                {item.tag && (
                  <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.tagCls}`}>
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-gray-800 text-sm leading-snug line-clamp-2">{item.title}</p>
              </div>
            </a>
          ))}
        </div>
        <button title="Cuộn sang phải" aria-label="Cuộn sang phải" onClick={() => scroll('right')} className="absolute -right-1 top-[38%] -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 opacity-0 group-hover/row:opacity-100 transition">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}

export default function NewsSection() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto divide-y divide-gray-50">
        {newsSections.map((group, i) => (
          <div key={i} className="py-8">
            <NewsGroup group={group} />
          </div>
        ))}
      </div>
    </div>
  );
}
