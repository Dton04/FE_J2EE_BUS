'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { bookingService, type BookingResponse } from '@/services/bookingService';
import { useAuthStore } from '@/store/useAuthStore';

type OrderTab = 'Hiện tại' | 'Đã đi' | 'Đã hủy';

const CURRENT_STATUSES = new Set(['HOLDING', 'PENDING_PAYMENT', 'CONFIRMED']);
const COMPLETED_STATUSES = new Set(['COMPLETED']);
const CANCELLED_STATUSES = new Set(['CANCELLED', 'EXPIRED']);

const normalizeStatus = (status?: string) => (status || '').toUpperCase();

const canCancelStatus = (status?: string) => {
  const s = normalizeStatus(status);
  return s === 'HOLDING' || s === 'PENDING_PAYMENT' || s === 'CONFIRMED';
};

const statusLabel = (status?: string) => {
  const s = normalizeStatus(status);
  if (CURRENT_STATUSES.has(s)) return 'Hiện tại';
  if (COMPLETED_STATUSES.has(s)) return 'Đã đi';
  if (CANCELLED_STATUSES.has(s)) return 'Đã hủy';
  return s || 'Không xác định';
};

const statusBadgeClass = (status?: string) => {
  const s = normalizeStatus(status);
  if (CURRENT_STATUSES.has(s)) return 'bg-blue-50 text-blue-700 border-blue-100';
  if (COMPLETED_STATUSES.has(s)) return 'bg-green-50 text-green-700 border-green-100';
  if (CANCELLED_STATUSES.has(s)) return 'bg-gray-100 text-gray-600 border-gray-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const formatMoney = (amount?: number) => {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return 'N/A';
  return `${amount.toLocaleString('vi-VN')}đ`;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('vi-VN');
};

const getTripIdsText = (booking: BookingResponse) => {
  const maybeLegs = (booking as { legs?: unknown }).legs;
  if (!Array.isArray(maybeLegs)) return 'N/A';

  const ids = maybeLegs
    .map((leg) => (leg && typeof leg === 'object' ? (leg as { trip_id?: string | number }).trip_id : undefined))
    .filter((id): id is string | number => id !== undefined && id !== null);

  return ids.length ? ids.join(', ') : 'N/A';
};

export default function OrdersContent() {
  const [activeTab, setActiveTab] = useState<OrderTab>('Hiện tại');
  const [orders, setOrders] = useState<BookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await bookingService.getMyBookings();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const s = normalizeStatus(order.status);
      if (activeTab === 'Hiện tại') return CURRENT_STATUSES.has(s);
      if (activeTab === 'Đã đi') return COMPLETED_STATUSES.has(s);
      return CANCELLED_STATUSES.has(s);
    });
  }, [orders, activeTab]);

  const handleCancel = async (orderId: number) => {
    setCancelingOrderId(orderId);
    try {
      await bookingService.cancelBooking(orderId);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to cancel booking', err);
      alert('Không thể hủy đơn hàng lúc này. Vui lòng thử lại.');
    } finally {
      setCancelingOrderId(null);
    }
  };

  return (
    <div className="flex-1 w-full">
      <div className="bg-white rounded-xl shadow-sm flex overflow-hidden">
        {['Hiện tại', 'Đã đi', 'Đã hủy'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as OrderTab)}
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
          <p className="text-[15px] text-gray-500">
            Bạn cần đăng nhập để xem đơn hàng, <Link href="/" className="text-[#2474E5] hover:underline">Đăng nhập ngay</Link>
          </p>
        ) : isLoading ? (
          <p className="text-[15px] text-gray-500">Đang tải đơn hàng...</p>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-[15px]">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <p className="text-[15px] text-gray-500">
            {activeTab === 'Đã hủy'
              ? 'Bạn không có chuyến nào đã hủy.'
              : `Bạn chưa có chuyến ${activeTab === 'Hiện tại' ? 'sắp đi' : 'đã đi'} nào, `}
            {activeTab !== 'Đã hủy' && (
              <Link href="/" className="text-[#2474E5] hover:underline">Đặt chuyến đi ngay</Link>
            )}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn</p>
                    <p className="text-base font-bold text-gray-900">{order.booking_code || `#${order.id}`}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${statusBadgeClass(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Tổng tiền</p>
                    <p className="font-semibold text-gray-900">{formatMoney(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Giữ chỗ đến</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(order.hold_expires_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Chuyến</p>
                    <p className="font-semibold text-gray-900">{getTripIdsText(order)}</p>
                  </div>
                </div>

                {canCancelStatus(order.status) && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelingOrderId === order.id}
                      className="px-4 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancelingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
