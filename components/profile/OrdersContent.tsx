'use client';
import { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Safe check for Hydration to avoid React crash
  const isAuthenticated = isMounted ? authStore.isAuthenticated : false;

  useEffect(() => {
    if (!isAuthenticated || !isMounted) return;

    const loadBookings = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await bookingService.getMyBookings(activeTab);
        setItems(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        console.error('Lỗi tải danh sách vé:', err);
        setError('Không thể tải danh sách chuyến đi. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [isAuthenticated, activeTab, isMounted]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle };
      case 'COMPLETED':
        return { label: 'Đã hoàn thành', color: 'bg-gray-100 text-gray-700', icon: CheckCircle2 };
      default:
        return { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
    }
  };

  const getPaymentDisplay = (status?: string) => {
    if (status === 'PAID') return <span className="text-green-600 font-bold">Đã thanh toán</span>;
    if (status === 'UNPAID') return <span className="text-red-500 font-bold">Chưa thanh toán</span>;
    return <span className="text-gray-500 font-bold">Không xác định</span>;
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso; // hiển thị đúng chuỗi ban đầu nếu parse lỗi
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!isAuthenticated && isMounted) {
    return (
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Ticket size={64} className="text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa đăng nhập</h2>
        <p className="text-gray-500 mb-6 max-w-sm">Vui lòng đăng nhập để xem danh sách vé xe và quản lý các chuyến đi của bạn.</p>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          Về trang chủ đăng nhập
        </Link>
      </div>
    );
  }

  // To prevent glitch while hydrating, render a loading state if not mounted yet
  if (!isMounted) {
    return (
      <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
