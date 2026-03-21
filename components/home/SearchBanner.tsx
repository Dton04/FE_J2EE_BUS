'use client';
import { MapPin, Calendar, RefreshCw, Bus, Plane, Train, Car } from 'lucide-react';
import { useState } from 'react';

export default function SearchBanner() {
  const [activeTab, setActiveTab] = useState('bus');

  const tabs = [
    { id: 'bus', label: 'Xe khách', icon: <Bus size={20} /> },
    { id: 'plane', label: 'Máy bay', icon: <Plane size={20} /> },
    { id: 'train', label: 'Tàu hỏa', icon: <Train size={20} /> },
    { id: 'rental', label: 'Thuê xe', icon: <Car size={20} /> },
  ];

  return (
    <div
      className="relative w-full pt-20 pb-16 flex flex-col items-center overflow-hidden px-10 bg-[center_top] bg-no-repeat bg-[#2474E5]"
      style={{
        backgroundImage: 'url("https://static.vexere.com/production/banners/1209/leaderboard_1440x480-(2).jpg")',
        backgroundSize: '100% auto'
      }}
    >
      <div className="z-10 text-center mb-8 mt-4 h-24">
        {/* Empty space for image text */}
      </div>

      <div className="z-10 w-full max-w-5xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] py-4 text-center font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="text-xl">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Search Form */}
        <div className="p-4 flex flex-col xl:flex-row items-center gap-3 relative">

          <div className="flex-1 flex flex-col md:flex-row w-full border border-gray-200 rounded-lg hover:border-blue-500 transition relative">
            <div className="flex-1 flex items-center p-3 cursor-text hover:bg-blue-50/50">
              <MapPin className="text-blue-500 mr-2" size={24} />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-500 font-medium">Nơi xuất phát</span>
                <input type="text" placeholder="Hà Nội" className="font-semibold outline-none text-lg w-full bg-transparent text-gray-800" />
              </div>
            </div>

            {/* Swap Button */}
            <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 p-2 rounded-full border border-gray-200 shadow-sm transition">
              <RefreshCw size={18} className="text-gray-500" />
            </button>

            <div className="flex-1 flex items-center p-3 border-t md:border-t-0 md:border-l border-gray-200 cursor-text hover:bg-blue-50/50 md:pl-8">
              <MapPin className="text-red-500 mr-2" size={24} />
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-500 font-medium">Nơi đến</span>
                <input type="text" placeholder="Hải Phòng" className="font-semibold outline-none text-lg w-full bg-transparent text-gray-800" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row w-full xl:w-auto mt-2 xl:mt-0 gap-3">
            <div className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition min-w-[200px] hover:bg-blue-50/50">
              <Calendar className="text-blue-500 mr-2" size={24} />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">Ngày đi</span>
                <span className="font-semibold text-lg text-gray-800">T7, 21/03/2026</span>
              </div>
            </div>

            <div className="flex items-center justify-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition min-w-[160px] hover:bg-blue-50/50">
              <span className="text-blue-500 font-semibold text-lg">+ Thêm ngày về</span>
            </div>
          </div>

          <button className="w-full xl:w-auto bg-[#FFD333] hover:bg-yellow-400 text-[#2474E5] font-bold text-lg py-4 px-10 rounded-lg mt-2 xl:mt-0 transition transform hover:scale-[1.02] shadow-md xl:whitespace-nowrap">
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Features below Search Banner */}
      <div className="z-10 flex flex-wrap justify-center gap-x-8 gap-y-4 mt-10 text-white font-medium text-sm">
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">✓</span> Chắc chắn có chỗ</div>
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">🎧</span> Hỗ trợ 24/7</div>
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">🎫</span> Nhiều ưu đãi</div>
        <div className="flex items-center gap-2 uppercase tracking-wide"><span className="text-yellow-400 text-lg">💲</span> Thanh toán đa dạng</div>
      </div>
    </div>
  );
}
