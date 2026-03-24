'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import CreateRouteModal from '@/components/admin/CreateRouteModal';
import { tripService } from '@/services/tripService';

interface AdminTrip {
  id: number;
  operator?: string;
  route?: string;
  time?: string;
  date?: string;
  price?: string;
  seats?: number | string;
  status?: string;
}

export default function AdminTripsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tripService.getAllTrips();
      setTrips(data || []);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const filteredTrips = trips.filter(trip => 
    trip.operator?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.route?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Chuyến xe</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý lịch trình, giá vé và số lượng chỗ của các nhà xe.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus size={20} />
          Thêm lộ trình mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo nhà xe, lộ trình..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <Filter size={18} />
            Bộ lọc
          </button>
          <select title="Filter by Status" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 outline-none hover:bg-gray-50 transition font-medium">
            <option>Tất cả trạng thái</option>
            <option>Đang chạy</option>
            <option>Sắp khởi hành</option>
            <option>Hết chỗ</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-500 font-medium">Đang tải dữ liệu chuyến xe...</p>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy chuyến xe nào</p>
              <p className="text-gray-400 text-sm">Hãy thử thêm mới hoặc thay đổi từ khóa tìm kiếm</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nhà xe</th>
                  <th className="px-6 py-4">Lộ trình</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Giá vé</th>
                  <th className="px-6 py-4">Ghế trống</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{trip.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{trip.operator}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{trip.route}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{trip.time}</div>
                      <div className="text-xs text-gray-500">{trip.date}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#2474E5]">{trip.price}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{trip.seats}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase ${
                        trip.status === 'Đang chạy' ? 'bg-blue-100 text-blue-700' :
                        trip.status === 'Hết chỗ' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                          <Trash2 size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors" title="Chi tiết">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && filteredTrips.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">Hiển thị {filteredTrips.length} chuyến</div>
            <div className="flex items-center gap-1">
              <button title="Previous Page" className="p-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"><ChevronLeft size={18}/></button>
              <span className="text-sm font-medium text-gray-600">Page 1 of 10</span>
              <button title="Next Page" className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      <CreateRouteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTrips} 
      />
    </div>
  );
}
