'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { bookingService, type MyBookingResponse } from '@/services/bookingService';
import { useAuthStore } from '@/store/useAuthStore';

export default function OrdersContent() {
  const [activeTab, setActiveTab] = useState('Hiện tại');
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<MyBookingResponse[]>([]);
  const [error, setError] = useState<string>('');
  const [paymentBanner, setPaymentBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      setPaymentBanner({ type: 'success', text: 'Thanh toán thành công.' });
    } else if (payment === 'failed') {
      setPaymentBanner({ type: 'error', text: 'Thanh toán thất bại hoặc đã bị huỷ.' });
    }

    if (payment) {
      params.delete('payment');
      params.delete('txnRef');
      const query = params.toString();
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, '', nextUrl);
      window.setTimeout(() => setPaymentBanner(null), 4000);
    }
  }, []);

  const queryType = useMemo(() => {
    if (activeTab === 'Đã đi') return 'HISTORY' as const;
    if (activeTab === 'Đã hủy') return 'HISTORY' as const;
    return 'UPCOMING' as const;
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'Đã hủy') {
      return items.filter((b) => b.status === 'CANCELLED' || b.status === 'EXPIRED');
    }
    if (activeTab === 'Đã đi') {
      return items.filter((b) => b.status !== 'CANCELLED' && b.status !== 'EXPIRED');
    }
    return items;
  }, [activeTab, items]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
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
    };

    load();
  }, [isAuthenticated, queryType]);

  const formatPrice = (value: number) => value.toLocaleString('vi-VN') + 'đ';
  const formatTime = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusBadge = (status: string) => {
    if (status === 'CONFIRMED') return 'bg-green-50 text-green-700 border-green-100';
    if (status === 'PENDING_PAYMENT') return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    if (status === 'HOLDING') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (status === 'CANCELLED' || status === 'EXPIRED') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };
  
  return (
    <div className="flex-1 w-full">
      {paymentBanner && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-[14px] font-bold border ${
            paymentBanner.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-red-50 text-red-700 border-red-100'
          }`}
        >
          {paymentBanner.text}
        </div>
      )}
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
        {!isAuthenticated ? (
          <div className="bg-white border border-gray-100 p-8 rounded-xl text-center shadow-sm">
            <div className="text-gray-700 font-semibold mb-2">Bạn cần đăng nhập để xem đơn hàng.</div>
            <div className="text-gray-500 text-sm mb-4">Vui lòng đăng nhập rồi quay lại trang này.</div>
            <Link href="/" className="text-[#2474E5] hover:underline font-medium">
              Về trang chủ
            </Link>
          </div>
        ) : isLoading ? (
          <div className="bg-white border border-gray-100 p-10 rounded-xl text-center shadow-sm">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-gray-500 font-medium">Đang tải đơn hàng...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-xl text-center font-medium">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white border border-gray-100 p-8 rounded-xl text-center shadow-sm">
            <div className="text-gray-700 font-semibold mb-2">
              {activeTab === 'Đã hủy' ? 'Bạn không có đơn hàng đã hủy.' : 'Bạn chưa có đơn hàng phù hợp.'}
            </div>
            <div className="text-gray-500 text-sm mb-4">Bạn có thể đặt chuyến mới để tạo đơn hàng.</div>
            <Link href="/" className="text-[#2474E5] hover:underline font-medium">
              Đặt chuyến đi ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredItems.map((b) => (
              <div
                key={b.booking_id}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition cursor-pointer"
                onClick={() => window.location.assign(`/profile/orders/${b.booking_id}`)}
                title="Xem chi tiết đơn"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold text-gray-900 truncate">
                      {b.route_name || 'Tuyến chưa xác định'}
                    </div>
                    <div className="text-[13px] text-gray-500 mt-1">
                      Mã đơn: <span className="font-semibold text-gray-700">{b.booking_code}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 text-[12px] font-bold border px-3 py-1 rounded-full ${statusBadge(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px] text-gray-600">
                  <div>
                    <div className="text-gray-400">Giờ khởi hành</div>
                    <div className="font-semibold text-gray-800">{formatTime(b.departure_time)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Số ghế</div>
                    <div className="font-semibold text-gray-800">{b.seat_count}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Tổng tiền</div>
                    <div className="font-semibold text-gray-800">{formatPrice(b.total_amount)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                  <div className="text-[13px] text-gray-600">
                    Thanh toán: <span className="font-semibold text-gray-800">{b.payment_status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
