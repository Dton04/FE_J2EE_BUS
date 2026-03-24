import { ShieldCheck, Clock, CreditCard, Headphones, Star, Users, MapPin, ThumbsUp } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck size={28} className="text-white" />,
    title: 'Chắc chắn có chỗ',
    desc: 'Vé được xác nhận ngay lập tức. Cam kết hoàn 150% nếu nhà xe không cung cấp dịch vụ.',
    from: 'from-blue-500',
    to: 'to-blue-700',
  },
  {
    icon: <Clock size={28} className="text-white" />,
    title: 'Đặt vé nhanh chóng',
    desc: 'Chỉ mất 60 giây để đặt vé. Nhận xác nhận ngay sau khi thanh toán thành công.',
    from: 'from-orange-400',
    to: 'to-orange-600',
  },
  {
    icon: <CreditCard size={28} className="text-white" />,
    title: 'Thanh toán đa dạng',
    desc: 'Hỗ trợ ATM nội địa, Visa, MasterCard, MoMo, ZaloPay, VNPay và nhiều hình thức khác.',
    from: 'from-green-500',
    to: 'to-green-700',
  },
  {
    icon: <Headphones size={28} className="text-white" />,
    title: 'Hỗ trợ 24/7',
    desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giải đáp mọi thắc mắc suốt 24 giờ mỗi ngày.',
    from: 'from-purple-500',
    to: 'to-purple-700',
  },
];

const stats = [
  { icon: <Users size={20} className="text-[#2474E5]" />, value: '3M+', label: 'Khách hàng tin dùng' },
  { icon: <MapPin size={20} className="text-[#2474E5]" />, value: '1000+', label: 'Tuyến đường' },
  { icon: <ThumbsUp size={20} className="text-[#2474E5]" />, value: '300+', label: 'Nhà xe hợp tác' },
  { icon: <Star size={20} className="text-[#2474E5]" />, value: '4.8⭐', label: 'Đánh giá trung bình' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 bg-[#f5f8ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tại sao chọn Vexere?</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Hơn 3 triệu khách hàng đã tin tưởng đặt vé qua Vexere. Nhanh chóng, an toàn và tiết kiệm.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.from} ${f.to} flex items-center justify-center mb-4 shadow-sm`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="bg-white rounded-2xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 shadow-sm overflow-hidden">
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-5">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-none">
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900 leading-none">{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
