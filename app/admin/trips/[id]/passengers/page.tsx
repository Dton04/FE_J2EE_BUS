'use client';
import { useState, use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Search,
  Filter,
  Ticket,
  User,
  Phone,
  CheckCircle2,
  Clock,
  XCircle,
  Bus
} from 'lucide-react';

// Mock dữ liệu tạm thời
const MOCK_PASSENGERS = [
  {
    id: 1001,
    passengerName: 'Nguyễn Văn A',
    phone: '0987654321',
    seatNumber: 'A01',
    price: 250000,
    ticketStatus: 'ACTIVE',
    checkInStatus: 'ON_BOARD'
  },
  {
    id: 1002,
    passengerName: 'Trần Thị B',
    phone: '0912345678',
    seatNumber: 'A02',
    price: 250000,
    ticketStatus: 'ACTIVE',
    checkInStatus: 'PENDING'
  },
  {
    id: 1003,
    passengerName: 'Lê Văn C',
    phone: '0909090909',
    seatNumber: 'B05',
    price: 250000,
    ticketStatus: 'CANCELLED',
    checkInStatus: 'PENDING'
  },
  {
    id: 1004,
    passengerName: 'Phạm Thị D',
    phone: '0933445566',
    seatNumber: 'B06',
    price: 250000,
    ticketStatus: 'ACTIVE',
    checkInStatus: 'ON_BOARD'
  }
];

export default function TripPassengersPage({ params }: { params: Promise<{ id: string }> }) {
  // Giải quyết params dạng Promise của Next.js 15+
  const { id: tripId } = use(params);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCheckIn, setFilterCheckIn] = useState('ALL');

  const filteredPassengers = MOCK_PASSENGERS.filter(p => {
    const matchSearch =
      (p.passengerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').includes(searchTerm) ||
      p.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter = filterCheckIn === 'ALL' || p.checkInStatus === filterCheckIn;

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Back button */}
      <div className="flex flex-col gap-4">
        <Link
          href="/admin/trips"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors w-fit font-medium"
        >
          <ChevronLeft size={20} />
          Quay lại Danh sách chuyến
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
              Quản lý trạng thái check-in và thông tin vé của hành khách trên chuyến xe này.
            </p>
          </div>

          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">Tổng khách</span>
              <span className="text-xl font-bold text-gray-900">{MOCK_PASSENGERS.length}</span>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xs text-green-600 font-medium mb-1 uppercase tracking-wider">Đã lên xe</span>
              <span className="text-xl font-bold text-green-600">
                {MOCK_PASSENGERS.filter(p => p.checkInStatus === 'ON_BOARD').length}
              </span>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div className="px-4 py-2 flex flex-col items-center">
              <span className="text-xs text-yellow-600 font-medium mb-1 uppercase tracking-wider">Chờ đón</span>
              <span className="text-xl font-bold text-yellow-600">
                {MOCK_PASSENGERS.filter(p => p.checkInStatus === 'PENDING' && p.ticketStatus === 'ACTIVE').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, số ghế..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <Filter size={18} />
            Trạng thái
          </button>
          <select
            value={filterCheckIn}
            onChange={(e) => setFilterCheckIn(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 outline-none hover:bg-gray-50 transition font-medium cursor-pointer"
          >
            <option value="ALL">Tất cả</option>
            <option value="ON_BOARD">Đã lên xe</option>
            <option value="PENDING">Chờ đón</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {filteredPassengers.length === 0 ? (
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
                  <th className="px-6 py-4 text-center">Trạng thái Check-in</th>
                  <th className="px-6 py-4 text-center">Trạng thái Vé</th>
                  <th className="px-6 py-4 text-right">Giá vé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPassengers.map((passenger) => (
                  <tr key={passenger.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {passenger.passengerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{passenger.passengerName}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone size={10} /> {passenger.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 font-bold text-sm">
                        <Bus size={14} />
                        {passenger.seatNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 font-medium">
                      #{passenger.id}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {passenger.checkInStatus === 'ON_BOARD' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-bold">
                          <CheckCircle2 size={14} /> Điểm danh
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-200 text-xs font-bold">
                          <Clock size={14} /> Chờ đón
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase ${passenger.ticketStatus === 'ACTIVE' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {passenger.ticketStatus === 'ACTIVE' ? 'Hợp lệ' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      {passenger.price.toLocaleString('vi-VN')} đ
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
