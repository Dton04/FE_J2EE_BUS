import { Smartphone, Star, Download, Shield } from 'lucide-react';

export default function AppDownload() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#1a56cb] to-[#2474E5] rounded-2xl overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-6 right-40 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-6 right-10 w-16 h-16 bg-yellow-400/20 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-8 md:px-14 py-10">
            {/* Left Content */}
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Star size={11} fill="currentColor" />
                Được đánh giá 4.8/5
              </div>
              <h2 className="text-3xl font-extrabold mb-2 leading-tight">
                Tải app Vexere<br />đặt vé siêu dễ!
              </h2>
              <p className="text-blue-100 text-sm mb-5 max-w-xs">
                Đặt vé xe, tàu, máy bay. Nhận thông báo chuyến đi, tra cứu và hủy vé mọi lúc mọi nơi.
              </p>

              {/* Features pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['Đặt vé nhanh', 'Theo dõi xe GPS', 'Thanh toán online', 'Hủy vé dễ dàng'].map(f => (
                  <span key={f} className="text-xs bg-white/15 px-3 py-1 rounded-full text-white backdrop-blur">{f}</span>
                ))}
              </div>

              {/* App Store buttons */}
              <div className="flex flex-wrap gap-3">
                <a href="#" className="flex items-center gap-2.5 bg-black text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-900 transition shadow-md">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-none">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div>
                    <p className="text-[10px] opacity-70 leading-none">Tải trên</p>
                    <p className="font-semibold leading-tight">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-2.5 bg-black text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-900 transition shadow-md">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-none">
                    <path d="M3.18 23.76c.28.16.61.19.93.08L14.39 12 3.02.16a1.12 1.12 0 00-.84.4V23.4c0 .13.02.26.06.38zM15.5 10.91L5.15 1.02 18.8 9.01l-3.3 1.9zm3.44 2.6L5.2 22.95l10.3-10.3 3.44 1.86zm.85-.49l-2.81-1.54 2.81-1.62c.8.45.8 2.72 0 3.16z" />
                  </svg>
                  <div>
                    <p className="text-[10px] opacity-70 leading-none">Tải trên</p>
                    <p className="font-semibold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 text-blue-100 text-xs">
                <div className="flex items-center gap-1.5"><Download size={13} /><span>5M+ lượt tải</span></div>
                <div className="flex items-center gap-1.5"><Smartphone size={13} /><span>iOS & Android</span></div>
                <div className="flex items-center gap-1.5"><Shield size={13} /><span>Bảo mật 100%</span></div>
              </div>
            </div>

            {/* Right – Phone mockup */}
            <div className="flex-none md:self-end">
              <div className="w-40 h-64 bg-black/20 rounded-[2.2rem] border-4 border-white/20 relative overflow-hidden shadow-2xl flex flex-col">
                {/* Notch */}
                <div className="w-14 h-3 bg-black/30 rounded-full mx-auto mt-3" />
                {/* Screen */}
                <div className="flex-1 mx-2 mb-3 bg-white/10 rounded-2xl mt-2 flex flex-col items-center justify-center gap-2 backdrop-blur">
                  <div className="text-3xl">🚌</div>
                  <p className="text-white font-bold text-sm">Vexere</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/60 text-[10px]">4.8 / 5 sao</p>
                </div>
                {/* Home indicator */}
                <div className="w-20 h-1 bg-white/30 rounded-full mx-auto mb-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
