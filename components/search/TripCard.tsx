'use client';
import { useState } from 'react';
import { Star, ShieldCheck, Tag } from 'lucide-react';
import Image from 'next/image';
import { tripService } from '../../services/tripService';

interface TripProps {
  id: string;
  image: string;
  operator: string;
  rating: number;
  reviews: number;
  type: string;
  departTime: string;
  departLocation: string;
  duration: string;
  arrivalTime: string;
  arrivalLocation: string;
  price: number;
  originalPrice?: number;
  discountNum?: number;
  availableSeats: number;
  badges: string[];
  promoText?: string;
}

export default function TripCard({ trip }: { trip: TripProps }) {
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [isLoadingStops, setIsLoadingStops] = useState(false);
  const [seatMapData, setSeatMapData] = useState<any>(null);
  const [stopsData, setStopsData] = useState<any>(null);

  const formatPrice = (p: number) => p.toLocaleString('vi-VN') + 'đ';

  const handleFetchSeats = async () => {
    if (seatMapData) {
      setSeatMapData(null); // toggle off
      return;
    }
    setStopsData(null);
    setIsLoadingSeats(true);
    try {
      // safely handle mock IDs by assuming ID 1 if parsing fails
      const tripId = parseInt(trip.id) || 1;
      const data = await tripService.getSeatMap(tripId);
      setSeatMapData(data || { "A01": "AVAILABLE", "A02": "SOLD", "message": "Mocked fallback data" });
    } catch (err) {
      console.error("Failed to fetch seat map", err);
      setSeatMapData({ error: 'Không thể kết nối đến server để lấy sơ đồ ghế.' });
    } finally {
      setIsLoadingSeats(false);
    }
  };

  const handleFetchStops = async () => {
    if (stopsData) {
      setStopsData(null); // toggle off
      return;
    }
    setSeatMapData(null);
    setIsLoadingStops(true);
    try {
      const tripId = parseInt(trip.id) || 1;
      const data = await tripService.getStops(tripId);
      setStopsData(data || [{ time: trip.departTime, location: trip.departLocation }]);
    } catch (err) {
      console.error("Failed to fetch stops", err);
      setStopsData({ error: 'Không thể kết nối đến server để lấy điểm dừng.' });
    } finally {
      setIsLoadingStops(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Top Ribbon */}
      {trip.promoText && (
        <div className="bg-[#00A32A] text-white px-4 py-1.5 flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-1">
            <span>✨</span>
            <span>{trip.promoText}</span>
          </div>
          <span className="text-[13px] font-medium text-green-100">Số lượng có hạn!</span>
        </div>
      )}

      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Left: Image */}
        <div className="relative w-full md:w-[150px] h-[150px] flex-none rounded-lg overflow-hidden">
          <Image src={trip.image} alt={trip.operator} fill className="object-cover" />
          <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
            ✨ Xe Xịn ✨
          </div>
        </div>

        {/* Middle: Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 border-b border-transparent">
              <h3 className="text-[17px] font-bold text-gray-900">{trip.operator}</h3>
              <div className="flex items-center gap-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                <Star size={12} fill="currentColor" />
                {trip.rating} <span className="font-medium text-blue-100">({trip.reviews})</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-4">{trip.type}</p>

            {/* Timeline */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#2474E5]" />
                <div className="w-px h-8 bg-gray-300 my-1 border-l border-dashed border-gray-400" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-red-500" />
              </div>
              <div className="flex flex-col justify-between" style={{ minHeight: '64px' }}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{trip.departTime}</span>
                  <span className="text-gray-600 text-sm">• {trip.departLocation}</span>
                </div>
                <div className="text-gray-400 text-sm">{trip.duration}</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{trip.arrivalTime}</span>
                  <span className="text-gray-600 text-sm">• {trip.arrivalLocation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Price & Action */}
        <div className="md:w-[200px] flex-none flex flex-col items-end justify-between border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <div className="text-[#00A32A] text-[22px] font-bold leading-none mb-1">
              Từ {formatPrice(trip.price)}
            </div>
            {trip.originalPrice && (
              <div className="flex items-center justify-end gap-2 text-sm">
                <span className="line-through text-gray-400">{formatPrice(trip.originalPrice)}</span>
                {trip.discountNum && (
                  <span className="bg-red-100 text-red-600 font-bold px-1 rounded">-{trip.discountNum}%</span>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-1 mt-2 flex-wrap">
              {trip.badges.map((b, i) => (
                <span key={i} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                  <Tag size={10} /> {b}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 text-right w-full">
            <div className="text-gray-600 text-sm mb-2 font-medium">
              Còn {trip.availableSeats} chỗ trống
            </div>
            <div className="flex items-center justify-end gap-2">
              <button 
                onClick={handleFetchStops}
                className="text-[#2474E5] text-sm font-medium hover:underline disabled:opacity-50"
                disabled={isLoadingStops}
              >
                {isLoadingStops ? 'Đang tải...' : 'Thông tin chi tiết'} <ChevronDown className="inline w-4 h-4" />
              </button>
              <button 
                onClick={handleFetchSeats}
                disabled={isLoadingSeats}
                className="bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {isLoadingSeats ? 'Đang xử lý...' : 'Chọn chuyến'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tags */}
      <div className="bg-gray-50/50 px-4 py-3 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#00A32A] mb-2 uppercase tracking-wide">
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Trả tận nơi</span>
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Theo dõi hành trình xe</span>
          <span className="flex items-center gap-1"><ShieldCheck size={14} /> Xác nhận tức thì</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#2474E5]">
          <span className="bg-[#2474E5] text-white text-[11px] font-bold px-2 py-0.5 rounded">Thông báo</span>
          <span className="hover:underline cursor-pointer">Tiện ích miễn phí - Hướng đi Cao tốc</span>
        </div>
      </div>

      {/* Dynamic Data Dropdowns (API Integration view) */}
      {(seatMapData || stopsData) && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm">
          {seatMapData && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Sơ đồ ghế (API /seats):</h4>
              <pre className="bg-white p-3 rounded border text-xs overflow-auto text-gray-700 max-h-40">
                {JSON.stringify(seatMapData, null, 2)}
              </pre>
            </div>
          )}
          {stopsData && (
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Các điểm dừng (API /stops):</h4>
              <pre className="bg-white p-3 rounded border text-xs overflow-auto text-gray-700 max-h-40">
                {JSON.stringify(stopsData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
