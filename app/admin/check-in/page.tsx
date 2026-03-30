'use client';
import { useState, useRef, useEffect } from 'react';
import { QrCode, CheckCircle2, XCircle, Search, Clock, User, ScanLine, Ticket } from 'lucide-react';

import { ticketService } from '@/services/ticketService';

// Types matching TicketResponse from BE
type TicketInfo = {
  id: number;
  passengerName: string;
  phone: string;
  seatNumber: string;
  price: number;
  ticketStatus: string;
  checkInStatus: string;
};
export default function CheckInPage() {
  const [ticketId, setTicketId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Trạng thái vé sau khi quét
  const [scannedTicket, setScannedTicket] = useState<TicketInfo | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error' | 'already_checked_in'>('idle');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input ngay khi load để hứng event từ máy quét barcode (nếu có)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCheckIn = async (id: string) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setScanStatus('idle');
    setScannedTicket(null);
    
    try {
      const response = await ticketService.checkIn(id);
      
      setScannedTicket(response);
      
      if (response.checkInStatus === 'ON_BOARD') {
        setScanStatus('success');
      } else {
        setScanStatus('already_checked_in');
      }
    } catch (error: unknown) {
      console.error('Check-in error:', error);
      const status =
        typeof (error as { response?: { status?: unknown } })?.response?.status === 'number'
          ? (error as { response?: { status?: number } }).response?.status
          : null;
      const messageRaw =
        typeof (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || '')
          : '';
      const message = messageRaw.toLowerCase();

      if (status === 400 && message.includes('already')) {
        setScanStatus('already_checked_in');
      } else {
        setScanStatus('error');
      }
    } finally {
      setLoading(false);
      setTicketId('');
      inputRef.current?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckIn(ticketId);
  };

  const simulateCameraScan = () => {
    setIsScanning(true);
    setScanStatus('idle');
    setScannedTicket(null);
    // Mock quét thành công sau 2s
    setTimeout(() => {
      setIsScanning(false);
      const randomTicket = `TK-${Math.floor(Math.random() * 10000)}`;
      handleCheckIn(randomTicket);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <QrCode className="text-blue-600" />
          Soát vé điện tử (Check-in)
        </h1>
        <p className="text-gray-500">
          Sử dụng máy quét mã vạch, quét QR qua Camera, hoặc nhập mã vé thủ công để cập nhật trạng thái lên xe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Cột trái: Form & Camera */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
          
          {/* Form nhập tay / hứng máy quét */}
          <form onSubmit={handleManualSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out font-medium"
                placeholder="Quét mã vạch hoặc nhập mã vé vào đây..."
                disabled={loading || isScanning}
              />
            </div>
            <button
              type="submit"
              disabled={!ticketId.trim() || loading || isScanning}
              className="px-6 py-3 bg-blue-600 border border-transparent rounded-xl text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? 'Đang xử lý...' : 'Soát vé'}
            </button>
          </form>

          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">HOẶC DÙNG CAMERA</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Khung Camera Mock */}
          <div className="flex-1 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {isScanning ? (
              <div className="animate-pulse flex flex-col items-center text-blue-600 gap-4">
                <div className="relative">
                  <ScanLine size={64} className="animate-bounce" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-scan"></div>
                </div>
                <p className="font-medium animate-pulse">Đang quét mã QR...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-400 text-center">
                <QrCode size={64} className="opacity-50" />
                <div>
                  <p className="font-medium text-gray-600">Camera chưa được bật</p>
                  <p className="text-sm">Nhấn nút bên dưới để cấp quyền và mở camera nội bộ</p>
                </div>
                <button 
                  onClick={simulateCameraScan}
                  className="mt-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <ScanLine size={18} />
                  Mở Camera quét QR
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cột phải: Kết quả */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Ticket className="text-blue-500" />
              Kết quả kiểm tra
            </h2>
          </div>
          
          <div className="flex-1 p-6 flex flex-col justify-center">
            {scanStatus === 'idle' && !loading && (
              <div className="text-center text-gray-400 flex flex-col items-center gap-3">
                <Ticket size={48} className="opacity-30" />
                <p>Quét hiển thị trạng thái vé tại đây</p>
              </div>
            )}

            {loading && (
              <div className="text-center text-blue-500 flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="font-medium">Đang kiểm tra hệ thống...</p>
              </div>
            )}

            {scanStatus === 'error' && (
              <div className="text-center text-red-500 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <XCircle size={64} />
                <div>
                  <p className="text-xl font-bold">Vé không hợp lệ!</p>
                  <p className="text-red-400">Không tìm thấy vé trong hệ thống hoặc vé đã bị hủy.</p>
                </div>
              </div>
            )}

            {scannedTicket && (scanStatus === 'success' || scanStatus === 'already_checked_in') && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                {/* Thông báo trạng thái */}
                <div className={`p-4 rounded-xl flex items-start gap-3 ${
                  scanStatus === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  {scanStatus === 'success' ? (
                    <CheckCircle2 size={24} className="flex-shrink-0 mt-0.5 text-green-500" />
                  ) : (
                    <Clock size={24} className="flex-shrink-0 mt-0.5 text-yellow-500" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {scanStatus === 'success' ? 'Soát vé thành công!' : 'Vé đã được soát trước đó!'}
                    </h3>
                    <p className={`text-sm ${scanStatus === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                      Trạng thái hiện tại: <span className="font-bold">ON_BOARD (Đã lên xe)</span>
                    </p>
                  </div>
                </div>

                {/* Chi tiết vé */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 text-sm">Mã vé (ID)</span>
                    <span className="font-bold font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded">
                      #{scannedTicket.id}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1 mb-1"><User size={12}/> Hành khách</span>
                      <p className="font-bold text-gray-800">{scannedTicket.passengerName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1 mb-1"><Ticket size={12}/> Số ghế</span>
                      <p className="font-bold text-blue-600 text-lg">{scannedTicket.seatNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1 mb-1"><Search size={12}/> Số điện thoại</span>
                      <p className="font-bold text-gray-800">{scannedTicket.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1 mb-1"><Ticket size={12}/> Giá vé</span>
                      <p className="font-bold text-gray-800">{scannedTicket.price?.toLocaleString('vi-VN') || 0} đ</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
