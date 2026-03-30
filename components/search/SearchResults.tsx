'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { tripService } from '../../services/tripService';
import TripCard from '@/components/search/TripCard';
import { provinceService, type ProvinceResponse } from '@/services/provinceService';

const PROMO_TAGS = [
  { id: 1, label: 'LUỒNG VÉ CHỐT DEAL', bg: 'bg-blue-500' },
  { id: 2, label: 'XE XỊN', bg: 'bg-yellow-500' },
  { id: 3, label: 'GIẢM GIÁ KHỨ HỒI', bg: 'bg-blue-400' },
  { id: 4, label: 'Xe có GPS xem vị trí xe', bg: 'bg-cyan-500' },
  { id: 5, label: 'Thêm chuyến chờ bạn', bg: 'bg-gray-600' },
];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<TripCardItem[]>([]);
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

        const parsePositiveInt = (value: string | null) => {
          if (!value) return null;
          const n = Number(value);
          if (!Number.isFinite(n) || n <= 0) return null;
          return Math.floor(n);
        };

        const normalize = (value: string) => value.trim().toLowerCase();

        const resolveProvinceId = (provinces: ProvinceResponse[], query: string): number | null => {
          const q = normalize(query);
          if (!q) return null;
          const exactName = provinces.find((p) => normalize(p.name) === q);
          if (exactName) return exactName.id;
          const includesName = provinces.find((p) => normalize(p.name).includes(q));
          if (includesName) return includesName.id;
          return null;
        };

        const originIdFromQuery = parsePositiveInt(fromIdParam);
        const destinationIdFromQuery = parsePositiveInt(toIdParam);

        let originId = originIdFromQuery;
        let destinationId = destinationIdFromQuery;

        if (!originId || !destinationId) {
          const provinces = await provinceService.getAllProvinces();
          const list = Array.isArray(provinces) ? provinces : [];
          if (!originId) originId = resolveProvinceId(list, fromStr);
          if (!destinationId) destinationId = resolveProvinceId(list, toStr);
        }

        if (!originId || !destinationId) {
          setTrips([]);
          setError('Không xác định được bến xe từ điểm đi/điểm đến. Vui lòng chọn lại.');
          return;
        }

        const data = await tripService.searchTrips(originId, destinationId, dateStr);
        
        const formatTime = (iso?: string) => {
          if (!iso) return '';
          const d = new Date(iso);
          if (Number.isNaN(d.getTime())) return '';
          return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        };

        const formatDuration = (start?: string, end?: string) => {
          if (!start || !end) return '';
          const s = new Date(start);
          const e = new Date(end);
          if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
          const totalMinutes = Math.max(0, Math.round((e.getTime() - s.getTime()) / 60000));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          if (hours === 0) return `${minutes}m`;
          return `${hours}h${String(minutes).padStart(2, '0')}m`;
        };

        const toNumber = (value: unknown): number | null => {
          if (typeof value === 'number' && Number.isFinite(value)) return value;
          if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.trim())) return Number(value);
          return null;
        };

        const toString = (value: unknown): string | null => (typeof value === 'string' ? value : null);

        const items = Array.isArray(data) ? data : [];
        const mappedTrips: TripCardItem[] = items.map((raw, idx) => {
          const t = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
          const legsRaw = Array.isArray(t.legs) ? (t.legs as unknown[]) : [];
          const firstLeg = (legsRaw[0] && typeof legsRaw[0] === 'object' ? legsRaw[0] : null) as Record<string, unknown> | null;
          const lastLeg = (legsRaw.length > 0 && typeof legsRaw[legsRaw.length - 1] === 'object'
            ? legsRaw[legsRaw.length - 1]
            : null) as Record<string, unknown> | null;

          const backendTripId =
            toNumber(firstLeg?.trip_id) ??
            toNumber(firstLeg?.tripId) ??
            toNumber(t.id) ??
            toNumber(t.trip_id) ??
            toNumber(t.tripId) ??
            null;

          const departureIso = toString(firstLeg?.departure) || null;
          const arrivalIso = toString(lastLeg?.arrival) || null;

          const totalPrice = toNumber(t.total_price) ?? toNumber(t.totalPrice) ?? 0;

          const availableSeatCandidates = legsRaw
            .map((leg) => {
              const r = (leg && typeof leg === 'object' ? leg : {}) as Record<string, unknown>;
              return toNumber(r.available_seats) ?? toNumber(r.availableSeats);
            })
            .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));

          const minAvailable = availableSeatCandidates.length ? Math.min(...availableSeatCandidates) : 0;

          const searchType = toString(t.type) || 'DIRECT';
          const layover = toString(t.layover_time) || toString(t.layoverTime) || '';

          const card: TripCardItem = {
            id: backendTripId != null ? `${backendTripId}-${idx}` : `row-${idx + 1}`,
            backendTripId,
            searchType,
            legs: legsRaw,
            image: `https://picsum.photos/seed/bus${backendTripId || idx}/400/400`,
            operator: 'Vexere Bus',
            rating: 4.5,
            reviews: 100,
            type: toString(firstLeg?.bus_type) || toString(firstLeg?.busType) || 'Standard',
            departTime: formatTime(departureIso || undefined) || '08:00',
            departLocation: toString(firstLeg?.origin) || fromStr,
            duration: formatDuration(departureIso || undefined, arrivalIso || undefined) || '6h00m',
            arrivalTime: formatTime(arrivalIso || undefined) || '14:00',
            arrivalLocation: toString(lastLeg?.destination) || toStr,
            price: totalPrice || 350000,
            availableSeats: minAvailable || 20,
            badges: [searchType === 'CONNECTING' ? 'Chuyến nối' : 'Xác nhận tức thì'],
            promoText: searchType === 'CONNECTING' ? `Chuyến nối • ${layover}`.trim() : undefined,
          };

          return card;
        });

        setTrips(mappedTrips);
      } catch (err: unknown) {
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

interface TripCardItem {
  id: string;
  backendTripId?: number | string | null;
  searchType?: string;
  legs?: unknown[];
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
