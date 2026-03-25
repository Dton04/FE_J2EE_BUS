'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tripService } from '../../services/tripService';
import TripCard from '@/components/search/TripCard';

const PROMO_TAGS = [
  { id: 1, label: 'LUỒNG VÉ CHỐT DEAL', bg: 'bg-blue-500' },
  { id: 2, label: 'XE XỊN', bg: 'bg-yellow-500' },
  { id: 3, label: 'GIẢM GIÁ KHỨ HỒI', bg: 'bg-blue-400' },
  { id: 4, label: 'Xe có GPS xem vị trí xe', bg: 'bg-cyan-500' },
  { id: 5, label: 'Thêm chuyến chờ bạn', bg: 'bg-gray-600' },
];

const LOCATION_MAP: Record<string, number> = {
  'Hà Nội': 1,
  'Hồ Chí Minh': 2,
  'Sài Gòn': 2,
  'Đà Nẵng': 3,
  'Nha Trang': 4,
  'Đà Lạt': 5,
  'Hải Phòng': 6,
  'Cần Thơ': 7,
};



export default function SearchResults() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      setError('');
      try {
        const fromStr = searchParams.get('from') || 'Hà Nội';
        const toStr = searchParams.get('to') || 'Nha Trang';
        
        const formatLocalYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dateStr = searchParams.get('date') || formatLocalYMD(new Date());
        
        const fromIdParam = searchParams.get('fromId');
        const toIdParam = searchParams.get('toId');

        const originId = fromIdParam ? parseInt(fromIdParam) : (LOCATION_MAP[fromStr] || 1);
        const destinationId = toIdParam ? parseInt(toIdParam) : (LOCATION_MAP[toStr] || 4);

        const data = await tripService.searchTrips(originId, destinationId, dateStr);
        
        // Map backend DTO to frontend TripProps format
        const mappedTrips = (data || []).map((t: any, idx: number) => {
          const backendTripId =
            t?.id ??
            t?.trip_id ??
            t?.tripId ??
            t?.trip?.id ??
            t?.legs?.[0]?.trip_id ??
            null;

          return {
          id: backendTripId != null ? String(backendTripId) : `row-${idx + 1}`,
          backendTripId,
          image: t.image || `https://picsum.photos/seed/bus${t.id || idx}/400/400`,
          operator: t.operatorName || t.bus?.operator?.name || 'Vexere Bus',
          rating: t.rating || 4.5,
          reviews: t.reviewCount || 100,
          type: t.busType || t.bus?.type || 'Limousine giường nằm',
          departTime: t.departureTime?.substring(0, 5) || '08:00',
          departLocation: t.departureLocation || fromStr,
          duration: t.duration || '6h00m',
          arrivalTime: t.arrivalTime?.substring(0, 5) || '14:00',
          arrivalLocation: t.arrivalLocation || toStr,
          price: t.price || t.ticketPrice || 350000,
          originalPrice: t.originalPrice,
          discountNum: t.discountNum,
          availableSeats: t.availableSeats ?? 20,
          badges: t.badges || ['Xác nhận tức thì'],
          promoText: t.promoText,
        }});

        setTrips(mappedTrips);
      } catch (err: any) {
        console.error(err);
        setError('Có lỗi xảy ra khi tìm kiếm chuyến xe. Vui lòng thử lại sau.');
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [searchParams]);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Kết quả chiều đi: {trips.length} chuyến
        </h2>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-sm font-bold text-gray-900 w-20 leading-tight">Tiêu chí lọc nhanh phổ biến</span>
        <div className="flex-1 flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {PROMO_TAGS.map((tag) => (
            <button
              key={tag.id}
              className={`${tag.bg} text-white font-bold text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-sm hover:opacity-90 transition`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium">Đang tìm kiếm chuyến xe...</p>
          </div>
        ) : error ? (
           <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl text-center font-medium">
              {error}
           </div>
        ) : trips.length === 0 ? (
           <div className="bg-white border border-gray-100 p-12 rounded-xl text-center shadow-sm">
              <div className="text-gray-400 mb-4 flex justify-center">
                 <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Không tìm thấy chuyến xe nào</h3>
              <p className="text-gray-500">Hãy thử thay đổi ngày đi hoặc tìm kiếm lộ trình khác.</p>
           </div>
        ) : (
          trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))
        )}
      </div>
    </div>
  );
}
