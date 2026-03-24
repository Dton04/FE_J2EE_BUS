'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function OrdersContent() {
  const [activeTab, setActiveTab] = useState('Hiện tại');
  
  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-xl shadow-sm flex overflow-hidden">
        {['Hiện tại', 'Đã đi', 'Đã hủy'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-center py-4 text-[15px] font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-[#2474E5] text-[#2474E5]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="pt-6 px-1">
        {activeTab === 'Hiện tại' && (
          <p className="text-[15px] text-gray-500">
            Bạn chưa có chuyến sắp đi nào, <Link href="/" className="text-[#2474E5] hover:underline">Đặt chuyến đi ngay</Link>
          </p>
        )}
        {activeTab === 'Đã đi' && (
          <p className="text-[15px] text-gray-500">
            Bạn chưa có chuyến đã đi nào, <Link href="/" className="text-[#2474E5] hover:underline">Đặt chuyến đi ngay</Link>
          </p>
        )}
        {activeTab === 'Đã hủy' && (
          <p className="text-[15px] text-gray-500">
            Bạn không có chuyến nào đã hủy.
          </p>
        )}
      </div>
    </div>
  );
}
