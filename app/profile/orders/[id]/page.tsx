'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Clock, 
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

export default function ETicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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
      } catch (err: any) {
        console.error('Lỗi tải E-Ticket:', err);
        const status = err?.response?.status;
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
                  <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Mã chuyến / Đơn hàng</h3>
                  <div className="text-2xl font-black font-mono tracking-tight text-[#2474E5]">
                     {booking_info.booking_code}
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
                        <span className="flex items-center gap-1"><Ticket size={14}/> BS: {trip_info.bus_plate}</span>
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
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tickets.map((t, index) => (
                     <div key={index} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50 hover:bg-white hover:border-blue-300 transition-colors">
                        <div>
                           <p className="text-xs text-gray-500 font-bold uppercase mb-1">Hành khách</p>
                           <p className="font-bold text-gray-800 truncate" title={t.passenger}>{t.passenger}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ghế</p>
                           <p className="font-black text-blue-600 text-xl">{t.seat}</p>
                        </div>
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
                     <span className={`font-bold px-3 py-1 rounded-full text-sm ${payment.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {payment.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
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

         </div>
      </div>
    </div>
  );
}
