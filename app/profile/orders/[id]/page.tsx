'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingService, type BookingDetailInfo } from '@/services/bookingService';
import { stationService, type StationResponse } from '@/services/stationService';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [data, setData] = useState<BookingDetailInfo | null>(null);
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [openNextModal, setOpenNextModal] = useState(false);
  const [nextToId, setNextToId] = useState<number>(0);
  const [nextDate, setNextDate] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [detail, stationList] = await Promise.all([
          bookingService.getBookingDetail(id),
          stationService.getAllStations(),
        ]);
        setData(detail);
        setStations(Array.isArray(stationList) ? stationList : []);
        const d = new Date();
        d.setDate(d.getDate() + 1);
        setNextDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      } catch (e: unknown) {
        const responseMessage =
          typeof (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
            ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
            : null;
        setError(responseMessage || 'Không thể tải chi tiết đơn hàng.');
      } finally {
        setIsLoading(false);
      }
    };
    if (Number.isFinite(id)) {
      load();
    }
  }, [id]);

  const arrivalCity = useMemo(() => {
    const route = data?.trip_info?.route || '';
    const parts = route.split('->').map((s) => s.trim());
    return parts.length >= 2 ? parts[1] : '';
  }, [data?.trip_info?.route]);

  const handleOpenNext = () => {
    setOpenNextModal(true);
  };

  const handleStartSearch = () => {
    const toStation = stations.find((s) => s.id === nextToId);
    const toCity = toStation?.city || toStation?.name || '';
    if (!arrivalCity || !toCity || !nextDate) return;
    router.push(`/search?from=${encodeURIComponent(arrivalCity)}&to=${encodeURIComponent(toCity)}&date=${nextDate}`);
  };

  if (!Number.isFinite(id)) {
    return <div className="p-8 text-center text-red-600 font-medium">ID đơn không hợp lệ.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-gray-500 font-medium">Đang tải chi tiết đơn...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 font-medium inline-block">
          {error || 'Không tìm thấy dữ liệu đơn hàng.'}
        </div>
        <div className="mt-4">
          <Link href="/profile/orders" className="text-[#2474E5] hover:underline font-bold">
            Quay lại danh sách đơn
          </Link>
        </div>
      </div>
    );
  }

  const { booking_info, trip_info, tickets, payment, qr_string } = data;
  const statusBadge =
    booking_info.status === 'CONFIRMED'
      ? 'bg-green-50 text-green-700 border-green-100'
      : booking_info.status === 'PENDING_PAYMENT'
        ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
        : booking_info.status === 'HOLDING'
          ? 'bg-blue-50 text-blue-700 border-blue-100'
          : 'bg-gray-50 text-gray-700 border-gray-100';

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/profile/orders" className="text-[#2474E5] hover:underline font-medium">
          ← Quay lại đơn hàng của tôi
        </Link>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${statusBadge}`}>
          {booking_info.status}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="text-sm text-gray-500 font-medium">Mã đơn</div>
          <div className="text-xl font-bold text-gray-900">{booking_info.booking_code}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-6 border-r border-gray-100">
            <div className="text-sm text-gray-500 font-medium">Thông tin chuyến</div>
            <div className="mt-2 font-bold text-gray-900">{trip_info.route}</div>
            <div className="mt-1 text-sm text-gray-600">Xe: {trip_info.bus_plate} • {trip_info.bus_type}</div>
            <div className="mt-1 text-sm text-gray-600">Giờ khởi hành: {trip_info.departure}</div>
            <div className="mt-1 text-sm text-gray-600">Điểm đón: {trip_info.pickup_point}</div>
          </div>
          <div className="p-6">
            <div className="text-sm text-gray-500 font-medium">Vé</div>
            <ul className="mt-2 text-sm text-gray-800 font-medium">
              {tickets.map((t, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span>Ghế {t.seat}</span>
                  <span>{t.passenger}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm text-gray-600">
              Thanh toán: <span className="font-bold text-gray-900">{payment.method}</span> • Tổng: <span className="font-bold text-gray-900">{payment.total.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex items-center justify-between">
          <div className="text-xs text-gray-500 font-medium truncate max-w-[60%]">QR: {qr_string}</div>
          <button
            onClick={handleOpenNext}
            className="px-4 py-2 rounded-lg bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold"
          >
            Đặt chuyến nối tiếp
          </button>
        </div>
      </div>

      {openNextModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-bold text-gray-900">Đặt chuyến nối tiếp</div>
              <button onClick={() => setOpenNextModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">Điểm đi</div>
              <div className="font-bold text-gray-900">{arrivalCity || '—'}</div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Điểm đến</div>
                <select
                  value={nextToId}
                  onChange={(e) => setNextToId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={0}>-- Chọn điểm đến --</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày đi</div>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button onClick={() => setOpenNextModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600">
                  Huỷ
                </button>
                <button
                  onClick={handleStartSearch}
                  disabled={!arrivalCity || nextToId === 0 || !nextDate}
                  className="px-4 py-2 rounded-lg bg-[#2474E5] text-white font-bold disabled:opacity-50"
                >
                  Tìm chuyến
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
