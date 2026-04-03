'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Bus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Ticket
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { bookingService, type BookingDetailResponse } from '@/services/bookingService';
import { useAuthStore } from '@/store/useAuthStore';
import { stationService, type StationResponse } from '@/services/stationService';
import { tripService } from '@/services/tripService';

export default function ETicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nextOpen, setNextOpen] = useState(false);
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [nextToId, setNextToId] = useState<number>(0);
  const [nextDate, setNextDate] = useState<string>('');
  const [nextSearching, setNextSearching] = useState(false);
  const [nextSearchError, setNextSearchError] = useState('');

  const authStore = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthenticated = isMounted ? authStore.isAuthenticated : false;

  useEffect(() => {
    if (!isAuthenticated || !isMounted) return;

    const loadTicketDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await bookingService.getBookingDetail(id);
        setTicket(data);
      } catch (err: unknown) {
        console.error('Lỗi tải E-Ticket:', err);
        const status =
          typeof (err as { response?: { status?: unknown } })?.response?.status === 'number'
            ? (err as { response?: { status?: number } }).response?.status
            : null;
        if (status === 403) {
          setError('Bạn không có quyền xem vé này. Vé có thể được đặt bởi tài khoản khác hoặc đặt ở chế độ khách (không đăng nhập).');
        } else if (status === 404) {
          setError('Không tìm thấy vé. Mã vé không tồn tại hoặc đã bị xóa.');
        } else {
          setError('Không thể tải thông tin vé. Vui lòng thử lại sau!');
        }
      } finally {
        setLoading(false);
      }
    };

    loadTicketDetail();
  }, [id, isAuthenticated, isMounted]);

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center min-h-[400px] flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
        <p className="text-gray-500 mb-6">Bạn phải đăng nhập để xem vé điện tử này.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang tải E-Ticket của bạn...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col gap-4">
        <Link href="/profile/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium w-fit mb-2 transition-colors">
          <ChevronLeft size={20} />
          Quay lại Đơn hàng của tôi
        </Link>
        <div className="bg-red-50 border border-red-100 p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-red-700 font-bold text-lg">{error || 'Không tìm thấy vé hợp lệ'}</p>
        </div>
      </div>
    );
  }

  const { booking_info, trip_info, tickets, payment, qr_string, policies } = ticket;

  const isConfirmed = booking_info.status === 'CONFIRMED';
  const isCancelled = booking_info.status === 'CANCELLED';

  const parseArrivalStation = (route: string) => {
    const parts = route.split('->').map((s) => s.trim()).filter(Boolean);
    return parts.length >= 2 ? parts[parts.length - 1] : '';
  };

  const parseDepartureStation = (route: string) => {
    const parts = route.split('->').map((s) => s.trim()).filter(Boolean);
    return parts.length >= 1 ? parts[0] : '';
  };

  const fromStation = parseArrivalStation(trip_info.route || '');

  const resolveStationId = (list: StationResponse[], query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return 0;
    const byName = list.find((s) => (s.name || '').trim().toLowerCase() === q);
    if (byName) return byName.id;
    const byCity = list.find((s) => (s.provinceName || '').trim().toLowerCase() === q);
    if (byCity) return byCity.id;
    const includesName = list.find((s) => (s.name || '').trim().toLowerCase().includes(q));
    if (includesName) return includesName.id;
    const includesCity = list.find((s) => (s.provinceName || '').trim().toLowerCase().includes(q));
    return includesCity?.id || 0;
  };

  const handleOpenNext = async () => {
    setNextOpen(true);
    setNextSearchError('');
    if (stations.length === 0) {
      try {
        const data = await stationService.getAllStations();
        setStations(Array.isArray(data) ? data : []);
      } catch {
        setStations([]);
      }
    }
    if (!nextDate) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      setNextDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
  };

  const handleSearchNext = async () => {
    setNextSearchError('');
    if (nextSearching) return;
    const list = stations;
    const originId = resolveStationId(list, fromStation);
    if (!originId) {
      setNextSearchError('Không xác định được điểm đi từ chuyến hiện tại.');
      return;
    }
    if (!nextToId || !nextDate) {
      setNextSearchError('Vui lòng chọn điểm đến và ngày đi.');
      return;
    }

    setNextSearching(true);
    try {
      const results = await tripService.searchTrips(originId, nextToId, nextDate);
      const items = Array.isArray(results) ? results : [];
      if (items.length === 0) {
        setNextSearchError('Không tìm thấy chuyến phù hợp. Vui lòng thử ngày khác.');
        return;
      }

      const toStation = list.find((s) => s.id === nextToId);
      const toText = toStation?.provinceName || toStation?.name || '';
      const params = new URLSearchParams({
        from: fromStation,
        to: toText,
        date: nextDate,
        fromId: String(originId),
        toId: String(nextToId),
      });
      window.location.assign(`/search?${params.toString()}`);
    } catch {
      setNextSearchError('Không thể tìm chuyến. Vui lòng thử lại.');
    } finally {
      setNextSearching(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/profile/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <ChevronLeft size={20} />
          Trở về
        </Link>

        {isConfirmed && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-green-200">
            <CheckCircle2 size={18} />
            Sẵn sàng khởi hành
          </div>
        )}
        {isCancelled && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm border border-red-200">
            <XCircle size={18} />
            Vé đã bị huỷ
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: QR Code & Booking Code */}
        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative Ticket cuts */}
            <div className="absolute top-1/2 -mt-4 -left-4 w-8 h-8 bg-gray-50 rounded-full border-r border-gray-100 shadow-inner"></div>
            <div className="absolute top-1/2 -mt-4 -right-4 w-8 h-8 bg-gray-50 rounded-full border-l border-gray-100 shadow-inner"></div>

            <div className="border-b-2 border-dashed border-gray-200 w-full absolute top-1/2 left-0"></div>

            <div className="mb-10 w-full flex flex-col items-center">
              <h3 className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Mã chuyến / Đơn hàng</h3>
              <div className="px-6 py-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 inline-block">
                <div className="text-2xl font-black font-mono tracking-wider text-white">
                  {booking_info.booking_code}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-2 w-full flex justify-center bg-white">
              <div className="bg-white p-4 border-2 border-gray-100 rounded-2xl shadow-sm inline-block relative z-10">
                {isCancelled ? (
                  <div className="w-48 h-48 bg-red-50 flex flex-col justify-center items-center text-red-500 border border-red-200 rounded-xl">
                    <XCircle size={40} className="mb-2" />
                    <span className="font-bold">MÃ KHÔNG HỢP LỆ</span>
                  </div>
                ) : (
                  <QRCode
                    value={qr_string || booking_info.booking_code}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                )}
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-6 font-medium">Xuất trình mã QR cho tài xế để lên xe</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <ShieldAlert className="text-blue-500 shrink-0" size={24} />
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              {policies || 'Vui lòng có mặt tại điểm đón trước 30 phút để sắp xếp hành lý. Vé không hỗ trợ hoàn hủy trước giờ đi 24h.'}
            </p>
          </div>
        </div>

        {/* Cột phải: Thông tin chuyến chi tiết */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">

          {/* Lộ Trình & Xe */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <Bus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{trip_info.route}</h2>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 mt-1">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-bold">{trip_info.bus_type}</span>
                  <span className="flex items-center gap-1"><Ticket size={14} /> BS: {trip_info.bus_plate}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Khởi hành</p>
                  <p className="font-bold text-gray-800 text-lg">{trip_info.departure}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Điểm đón</p>
                  <p className="font-bold text-gray-800 text-lg">{trip_info.pickup_point}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hành Khách */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="text-blue-500" /> Thông tin Hành khách & Ghế
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {tickets.map((t, index) => (
                <div key={index} className="relative bg-white border-2 border-dashed border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:bg-blue-50/20 transition-all group shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Ticket size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Hành khách</p>
                        <p className="font-bold text-gray-800 text-lg">{t.passenger}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                           <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[11px] font-black font-mono shadow-sm">
                             {t.ticket_code}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400">GHẾ: {t.seat}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative dot */}
                  <div className="absolute -left-1.5 top-1/2 -mt-1 w-3 h-3 bg-gray-50 rounded-full border border-gray-100"></div>
                  <div className="absolute -right-1.5 top-1/2 -mt-1 w-3 h-3 bg-gray-50 rounded-full border border-gray-100"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Thanh toán */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="text-blue-500" /> Chi tiết thanh toán
            </h3>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Trạng thái</span>
                <span className={`font-bold px-3 py-1 rounded-full text-sm ${payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-green-100 text-green-700'}`}>
                  {payment.status === 'PAID' ? 'Đã thanh toán' : 'Đã thanh toán'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Phương thức</span>
                <span className="font-bold text-gray-800">{payment.method || 'Thanh toán trực tuyến'}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-gray-600 font-bold text-lg">Tổng cộng</span>
                <span className="font-black text-3xl text-[#2474E5]">
                  {(payment.total || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Đặt chuyến nối tiếp</h3>
            <div className="text-sm text-gray-600">
              Điểm đi sẽ lấy theo điểm đến của chuyến hiện tại: <span className="font-bold text-gray-900">{fromStation || parseDepartureStation(trip_info.route || '') || '—'}</span>
            </div>
            <div className="mt-4">
              <button
                onClick={handleOpenNext}
                className="bg-[#FFD333] hover:bg-yellow-400 text-gray-900 font-bold px-5 py-3 rounded-xl transition"
              >
                Tìm chuyến nối tiếp
              </button>
            </div>
          </div>

        </div>
      </div>

      {nextOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-bold text-gray-900">Tìm chuyến nối tiếp</div>
              <button onClick={() => setNextOpen(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600" title="Close">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              {nextSearchError && (
                <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-3 py-2 text-sm font-bold">
                  {nextSearchError}
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600 mb-1">Điểm đi</div>
                <div className="font-bold text-gray-900">{fromStation || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Điểm đến</div>
                <select
                  value={nextToId}
                  onChange={(e) => setNextToId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value={0}>-- Chọn điểm đến --</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.provinceName})
                    </option>
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
                <button onClick={() => setNextOpen(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 font-bold">
                  Huỷ
                </button>
                <button
                  onClick={handleSearchNext}
                  disabled={!fromStation || nextToId === 0 || !nextDate || nextSearching}
                  className="px-4 py-2 rounded-lg bg-[#2474E5] text-white font-bold disabled:opacity-50"
                >
                  {nextSearching ? 'Đang tìm...' : 'Tìm chuyến'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
