'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Bus, 
  Users,
  Trash2, 
  Edit2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { busService, BusResponse } from '@/services/busService';
import CreateBusModal from '@/components/admin/CreateBusModal';

export default function AdminBusesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await busService.getAllBuses();
      setBuses(data || []);
    } catch (error) {
      console.error('Failed to fetch buses:', error);
      setError('Không thể tải danh sách xe. Vui lòng kiểm tra lại kết nối API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      try {
        await busService.deleteBus(id);
        fetchBuses();
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa xe.');
      }
    }
  };

  const filteredBuses = buses.filter(bus => 
    bus.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.bus_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bus className="text-[#2474E5]" />
            Quản lý Xe
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh sách các xe buýt trong hệ thống.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          Thêm xe mới
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo biển số, loại xe..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium">
            <Filter size={18} />
            Bộ lọc
          </button>
        </div>
      </div>

      {error && !loading && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button 
            onClick={fetchBuses}
            className="ml-auto text-sm font-bold underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-gray-500 font-medium text-lg animate-pulse">Đang tải dữ liệu xe...</p>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <Bus size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium text-lg">Không tìm thấy xe nào</p>
              <p className="text-gray-400 text-sm">Hãy thử thêm mới hoặc thay đổi từ khóa tìm kiếm</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Biển số xe</th>
                  <th className="px-6 py-4">Số ghế</th>
                  <th className="px-6 py-4">Loại xe</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">#{bus.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{bus.license_plate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <Users size={14} className="text-gray-400" />
                        {bus.total_seats} ghế
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                        {bus.bus_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase ${
                        bus.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {bus.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Sửa">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(bus.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && filteredBuses.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div className="text-sm text-gray-500 font-medium">Hiển thị {filteredBuses.length} xe</div>
            <div className="flex items-center gap-1">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed bg-white"><ChevronLeft size={18}/></button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2474E5] text-white font-bold text-sm shadow-sm">1</button>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition bg-white shadow-sm"><ChevronRight size={18}/></button>
            </div>
          </div>
        )}
      </div>

      <CreateBusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchBuses} 
      />
    </div>
  );
}
