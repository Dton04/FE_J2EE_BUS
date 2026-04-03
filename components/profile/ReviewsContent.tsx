'use client';
import { useState, useEffect } from 'react';
import { Star, Edit3, Trash2, Loader2, Camera, XCircle, Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { reviewService, type ReviewResponse } from '@/services/reviewService';
import ReviewModal from '@/components/profile/ReviewModal';
import { bookingService, type MyBookingResponse } from '@/services/bookingService';

export default function ReviewsContent() {
  const authStore = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [myReviews, setMyReviews] = useState<ReviewResponse[]>([]);
  const [completedBookings, setCompletedBookings] = useState<MyBookingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'to-review'>('to-review');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<MyBookingResponse | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthenticated = isMounted ? authStore.isAuthenticated : false;

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [reviewsData, bookingsData] = await Promise.all([
        reviewService.getMyReviews().catch(() => []),
        bookingService.getMyBookings('HISTORY').catch(() => []),
      ]);

      setMyReviews(Array.isArray(reviewsData) ? reviewsData : []);

      // Chỉ lấy các booking đã hoàn thành (COMPLETED)
      const completed = (Array.isArray(bookingsData) ? bookingsData : []).filter(
        (b) => b.status === 'COMPLETED'
      );
      setCompletedBookings(completed);
    } catch (err) {
      console.error(err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isMounted) return;
    loadData();
  }, [isAuthenticated, isMounted]);

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    setDeletingId(reviewId);
    try {
      await reviewService.deleteReview(reviewId);
      setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      alert('Xóa đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (iso: string | null | undefined) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number, size = 16) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'}
      />
    ));

  // Kiểm tra booking đã được đánh giá chưa dựa trên danh sách myReviews
  const reviewedBookingIds = new Set(myReviews.map((r) => r.booking_id));
  const pendingReviews = completedBookings.filter((b) => !reviewedBookingIds.has(b.booking_id));

  if (!isMounted) {
    return (
      <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <Star size={64} className="text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa đăng nhập</h2>
        <p className="text-gray-500 mb-6 max-w-sm">Vui lòng đăng nhập để xem và gửi đánh giá chuyến đi.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
          Về trang chủ đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 w-full flex flex-col gap-6">
        {/* Header & Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row items-center justify-between p-2">
          <div className="flex w-full sm:w-auto p-1 bg-gray-50 rounded-xl">
            <button
              onClick={() => setActiveTab('to-review')}
              className={`flex-1 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'to-review' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Edit3 size={14} />
              Chờ đánh giá
              {pendingReviews.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {pendingReviews.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 sm:px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'reviews' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star size={14} />
              Đánh giá của tôi
              {myReviews.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {myReviews.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[300px] gap-3">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-500 font-medium">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-12 flex flex-col items-center gap-3 min-h-[300px] justify-center">
            <XCircle size={40} className="text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={loadData} className="text-sm text-blue-600 font-bold hover:underline">
              Thử lại
            </button>
          </div>
        ) : activeTab === 'to-review' ? (
          /* ─── Tab: Chờ đánh giá ─── */
          <div className="flex flex-col gap-4">
            {pendingReviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center text-center gap-3 min-h-[300px] justify-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                  <Star size={36} className="text-green-400 fill-green-100" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Không có chuyến đi nào chờ đánh giá</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Bạn đã đánh giá tất cả chuyến đi hoàn thành. Cảm ơn bạn!
                </p>
              </div>
            ) : (
              pendingReviews.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400" />
                  <div className="p-5 pl-7">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        {/* Booking code + status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-black font-mono">
                            #{booking.booking_code}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            Đã hoàn thành
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                          {booking.route_name || 'Chuyến đi'}
                        </h3>

                        {booking.departure_time && (
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar size={14} className="text-gray-400" />
                            {formatTime(booking.departure_time)}
                          </div>
                        )}
                      </div>

                      <button
                        id={`review-btn-${booking.booking_id}`}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-all shadow-sm hover:shadow-md text-sm whitespace-nowrap"
                      >
                        <Star size={16} className="fill-current" />
                        Đánh giá ngay
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ─── Tab: Đánh giá của tôi ─── */
          <div className="flex flex-col gap-4">
            {myReviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center text-center gap-3 min-h-[300px] justify-center">
                <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Star size={36} className="text-yellow-400 fill-yellow-100" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Bạn chưa có đánh giá nào</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Hãy đánh giá các chuyến đi đã hoàn thành để giúp cộng đồng.
                </p>
                <button
                  onClick={() => setActiveTab('to-review')}
                  className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Edit3 size={14} /> Xem chuyến chờ đánh giá
                </button>
              </div>
            ) : (
              myReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                  <div className="p-5 pl-7">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Route & time */}
                        <div>
                          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                            <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                            {review.route_name || `Đặt vé #${review.booking_id}`}
                          </h3>
                          {review.departure_time && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar size={12} /> {formatTime(review.departure_time)}
                            </p>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating, 18)}
                          <span className="text-xs font-bold text-gray-500 ml-1">({review.rating}/5)</span>
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
                          {review.comment}
                        </p>

                        {/* Images */}
                        {review.image_urls && review.image_urls.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {review.image_urls.map((url, idx) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer">
                                  <Image
                                    src={url}
                                    alt={`Ảnh đánh giá ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Timestamps */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                          <Clock size={12} />
                          Đã đánh giá lúc {formatTime(review.created_at)}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                        title="Xóa đánh giá"
                      >
                        {deletingId === review.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {modalOpen && selectedBooking && (
        <ReviewModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedBooking(null);
          }}
          onSuccess={() => {
            loadData();
            setActiveTab('reviews');
          }}
          bookingId={selectedBooking.booking_id}
          bookingCode={selectedBooking.booking_code}
          routeName={selectedBooking.route_name}
          departureTime={selectedBooking.departure_time}
        />
      )}
    </>
  );
}
