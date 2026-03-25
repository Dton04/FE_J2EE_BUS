'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Ticket, Calendar, MapPin, CheckCircle2, XCircle, Clock, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { bookingService, type MyBookingResponse } from '@/services/bookingService';

export default function OrdersContent() {
  // 2 Tabs: UPCOMING (Sắp đi), HISTORY (Lịch sử)
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'HISTORY'>('UPCOMING');
  const authStore = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState<MyBookingResponse[]>([]);
  const [error, setError] = useState<string>('');
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);

  const queryType = useMemo(() => {
    if (activeTab === 'Hiện tại') return 'UPCOMING' as const;
    return 'ALL' as const; // dùng ALL để client tự filter, tránh backend trả rỗng theo HISTORY
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'Đã hủy') {
      return items.filter((b) => ['CANCELLED', 'EXPIRED'].includes((b.status || '').toUpperCase()));
    }
    if (activeTab === 'Đã đi') {
      return items.filter((b) => ['COMPLETED', 'CONFIRMED', 'PENDING_PAYMENT', 'HOLDING'].includes((b.status || '').toUpperCase()));
    }
    return items.filter((b) => ['HOLDING', 'PENDING_PAYMENT'].includes((b.status || '').toUpperCase()));
  }, [activeTab, items]);

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await bookingService.getMyBookings(queryType);
      setItems(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const responseMessage =
        typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(responseMessage || 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load, queryType]);

  const handleCancel = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;

    setCancelingOrderId(orderId);
    try {
      await bookingService.cancelBooking(orderId);
      await load();
      alert('Hủy đơn hàng thành công.');
    } catch (err) {
      console.error('Failed to cancel booking', err);
      alert('Không thể hủy đơn hàng lúc này. Vui lòng thử lại.');
    } finally {
      setCancelingOrderId(null);
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // hiển thị đúng chuỗi ban đầu nếu parse lỗi
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusBadge = (status: string) => {
    if (status === 'CONFIRMED') return 'bg-green-50 text-green-700 border-green-100';
    if (status === 'PENDING_PAYMENT') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    if (status === 'HOLDING') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (status === 'CANCELLED' || status === 'EXPIRED') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const canCancelStatus = (status: string | undefined) => {
    const s = (status || '').toUpperCase();
    // chỉ cho phép hủy 3 trạng thái này theo luồng yêu cầu
    return ['HOLDING', 'PENDING_PAYMENT', 'UNPAID'].includes(s);
  };
  
  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row items-center justify-between p-2">
        <div className="flex w-full sm:w-auto p-1 bg-gray-50 rounded-xl">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sắp đi
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 sm:px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lịch sử chuyến
          </button>
        </div>
      </div>
      
      {/* Content List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
             <p className="text-gray-500 font-medium">Đang tải danh sách chuyến đi...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-12 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px]">
             <XCircle size={40} className="text-red-500 mb-3" />
             <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 rounded-2xl text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Ticket size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {activeTab === 'UPCOMING' ? 'Bạn chưa có chuyến đi nào sắp tới' : 'Chưa có lịch sử chuyến đi'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">Khám phá hàng ngàn tuyến đường xe khách và đặt vé ngay hôm nay.</p>
            <Link 
              href="/" 
              className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-6 py-2.5 rounded-xl font-bold transition-colors"
            >
              Tìm chuyến đi ngay
            </Link>
          </div>
        ) : (
          items.map((booking) => {
            const statusInfo = getStatusDisplay(booking.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Link 
                href={`/profile/orders/${booking.booking_id}`}
                key={booking.booking_id} 
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative block cursor-pointer"
              >
                {/* Ribbon trang trí */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>

                <div className="p-5 pl-7">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider">
                        #{booking.booking_code}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    
                    {/* Route Info */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-blue-500" size={20} />
                        {booking.route_name}
                      </h3>
                      
                      {booking.departure_time && (
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                          <Calendar size={16} className="text-gray-400" />
                          {formatTime(booking.departure_time)}
                        </div>
                      )}
                    </div>

                    {/* Booking Stats */}
                    <div className="flex flex-col gap-3 md:items-end justify-center bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-w-[200px]">
                      {booking.seat_count && (
                        <div className="flex items-center justify-between w-full gap-4 text-sm">
                          <span className="text-gray-500">Số lượng ghế:</span>
                          <span className="font-bold text-gray-800">{booking.seat_count}</span>
                        </div>
                      )}
                      
                      {booking.total_amount && (
                        <div className="flex items-center justify-between w-full gap-4 text-sm">
                          <span className="text-gray-500">Tổng tiền:</span>
                          <span className="font-bold text-blue-600 text-lg">
                            {booking.total_amount.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      )}

                      {booking.payment_status && (
                        <div className="flex items-center justify-between w-full gap-4 text-sm border-t border-gray-200 pt-2 mt-1">
                          <span className="text-gray-500 flex items-center gap-1">
                            <CreditCard size={14}/> Thanh toán:
                          </span>
                          {getPaymentDisplay(booking.payment_status)}
                        </div>
                      )}
                    </div>
                  </div>
                  {canCancelStatus(b.status) && (
                    <button
                      onClick={() => handleCancel(b.booking_id)}
                      disabled={cancelingOrderId === b.booking_id}
                      className="text-sm font-semibold px-4 py-2 border rounded-lg border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancelingOrderId === b.booking_id ? 'Đang hủy...' : 'Hủy chuyến'}
                    </button>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
