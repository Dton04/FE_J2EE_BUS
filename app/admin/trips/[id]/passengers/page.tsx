'use client';
import { useState, use, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Search,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Bus,
  Loader2,
  AlertCircle,
  ScanLine,
  RefreshCw,
} from 'lucide-react';
import { tripService } from '@/services/tripService';
import { ticketService } from '@/services/ticketService';

interface Passenger {
  id: number;
  passenger_name: string;
  phone: string;
  seat_number: string;
  price: number;
  ticket_status: 'ACTIVE' | 'CANCELLED' | string;
  check_in_status: 'NOT_YET' | 'ON_BOARD' | string;
}

export default function TripPassengersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tripId } = use(params);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCheckIn, setFilterCheckIn] = useState('ALL');
  const [checkingIn, setCheckingIn] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string; type: 'ok' | 'err' } | null>(null);

  const fetchPassengers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.getPassengers(tripId);
      setPassengers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách hành khách:', err);
      setError('Không thể tải danh sách hành khách. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { fetchPassengers(); }, [fetchPassengers]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCheckIn = async (passenger: Passenger) => {
    if (passenger.check_in_status === 'ON_BOARD') return;
    setCheckingIn(passenger.id);
    try {
      await ticketService.checkIn(passenger.id);
      setPassengers(prev => prev.map(p =>
        p.id === passenger.id ? { ...p, check_in_status: 'ON_BOARD' } : p
      ));
      setToast({ id: Date.now(), msg: `Check-in thành công: ${passenger.passenger_name} - Ghế ${passenger.seat_number}`, type: 'ok' });
    } catch (err: unknown) {
      const msg = typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Check-in thất bại';
      setToast({ id: Date.now(), msg: `${msg}`, type: 'err' });
    } finally {
      setCheckingIn(null);
    }
  };

  const filteredPassengers = passengers.filter(p => {
    const matchSearch =
      (p.passenger_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm) ||
      (p.seat_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterCheckIn === 'ALL' || p.check_in_status === filterCheckIn;
    return matchSearch && matchFilter;
  });

  const onBoardCount = passengers.filter(p => p.check_in_status === 'ON_BOARD').length;
  const pendingCount = passengers.filter(p => p.check_in_status === 'NOT_YET' && p.ticket_status === 'ACTIVE').length;
  const progressPct = passengers.length > 0 ? Math.round((onBoardCount / passengers.length) * 100) : 0;

  return (
    <div className="space-y-6 relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all ${toast.type === 'ok' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
          {toast.type === 'ok' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-fit font-medium"
        >
          <ChevronLeft size={20} />
          Quay lại danh sách chuyến
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-800">Danh sách hành khách</h1>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-200">
                Chuyến #{tripId}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Soát vé trực tiếp bằng nút Check-in trên từng hàng hoặc qua trang Soát vé QR.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm min-w-[160px]">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Tiến độ check-in</span>
                <span className="text-xs font-bold text-blue-600">{progressPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <div className="px-4 py-2 flex flex-col items-center">
                <span className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Tổng</span>
                <span className="text-xl font-bold text-gray-900">{passengers.length}</span>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="px-4 py-2 flex flex-col items-center">
                <span className="text-xs text-green-600 font-medium mb-1 uppercase tracking-wider">Lên xe</span>
                <span className="text-xl font-bold text-green-600">{onBoardCount}</span>
              </div>
              <div className="w-px bg-gray-200" />
              <div className="px-4 py-2 flex flex-col items-center">
                <span className="text-xs text-yellow-600 font-medium mb-1 uppercase tracking-wider">Chờ</span>
                <span className="text-xl font-bold text-yellow-600">{pendingCount}</span>
              </div>
            </div>

            <button
              onClick={fetchPassengers}
              disabled={loading}
              className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-300 transition shadow-sm"
              title="Lam moi"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm tên, SDT, số ghế..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCheckIn}
            onChange={(e) => setFilterCheckIn(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 outline-none hover:bg-gray-50 transition font-medium cursor-pointer"
          >
            <option value="ALL">Tất cả Check-in</option>
            <option value="ON_BOARD">Đã lên xe</option>
            <option value="NOT_YET">Chờ</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-500 font-medium">Đang tải dữ liệu hành khách...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-500">
              <AlertCircle size={48} />
              <p className="font-medium">{error}</p>
              <button onClick={() => fetchPassengers()} className="px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition text-sm font-bold">
                Thử lại
              </button>
            </div>
          ) : filteredPassengers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <User size={48} className="text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy hành khách nào</p>
              <p className="text-gray-400 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Hành khách</th>
                  <th className="px-6 py-4">Số ghế</th>
                  <th className="px-6 py-4">Mã vé</th>
                  <th className="px-6 py-4 text-center">Trạng thái vé</th>
                  <th className="px-6 py-4 text-center">Check-in</th>
                  <th className="px-6 py-4 text-right">Giá vé</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPassengers.map((passenger) => (
                  <tr key={passenger.id} className={`hover:bg-gray-50/50 transition-colors ${passenger.check_in_status === 'ON_BOARD' ? 'bg-green-50/30' : ''
                    }`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase ${passenger.check_in_status === 'ON_BOARD' ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                          {(passenger.passenger_name || 'H').charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{passenger.passenger_name || 'Khach le'}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone size={10} /> {passenger.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 font-bold text-sm">
                        <Bus size={14} />
                        {passenger.seat_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 font-medium">
                      #{passenger.id}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase ${passenger.ticket_status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-100 text-red-700'
                        }`}>
                        {passenger.ticket_status === 'ACTIVE' ? 'Hợp lệ' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {passenger.check_in_status === 'ON_BOARD' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-bold">
                          <CheckCircle2 size={14} /> Đã lên xe
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 text-xs font-bold">
                          <Clock size={14} /> Chờ
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      {(passenger.price || 0).toLocaleString('vi-VN')} d
                    </td>
                    <td className="px-6 py-4 text-center">
                      {passenger.check_in_status === 'ON_BOARD' ? (
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1 justify-center">
                          <CheckCircle2 size={14} /> Xong
                        </span>
                      ) : passenger.ticket_status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleCheckIn(passenger)}
                          disabled={checkingIn === passenger.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-60 shadow-sm"
                        >
                          {checkingIn === passenger.id
                            ? <><Loader2 size={12} className="animate-spin" /> Xử lý...</>
                            : <><ScanLine size={12} /> Check-in</>
                          }
                        </button>
                      ) : (
                        <span className="text-xs text-red-400 font-medium">Vé hủy</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
