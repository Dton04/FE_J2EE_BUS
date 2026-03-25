'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Route as RouteIcon,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { routeService, RouteResponse } from '@/services/routeService';
import CreateEditRouteModal from '@/components/admin/CreateEditRouteModal';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<RouteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteResponse | null>(null);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await routeService.getAllRoutes();
      console.log('Raw routes data received:', data);
      
      // Handle various response formats
      let routesList: RouteResponse[] = [];
      if (Array.isArray(data)) {
        routesList = data;
      } else if (data && typeof data === 'object') {
        routesList = (data as any).content || (data as any).routes || (data as any).data || [];
      }
      
      console.log('Processed routes list:', routesList);
      setRoutes(routesList);
    } catch (error) {
      console.error('Failed to fetch routes', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  useEffect(() => {
    console.log('Routes state updated:', routes);
  }, [routes]);

  const handleEdit = (route: RouteResponse) => {
    setEditingRoute(route);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tuyến đường này?')) {
      try {
        await routeService.deleteRoute(id);
        fetchRoutes();
      } catch (error) {
        alert('Không thể xóa tuyến đường này vì có thể đang có chuyến xe hoạt động.');
      }
    }
  };

  const filteredRoutes = routes.filter(r => 
    (r.departure || r.origin_station?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.destination || r.destination_station?.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price?: number) => {
    if (price === undefined) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}p`;
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <RouteIcon className="text-[#2474E5]" />
            Quản lý Tuyến & Giá
          </h1>
          <p className="text-sm text-gray-500 mt-1">Thiết lập lộ trình di chuyển và đơn giá cơ bản cho mỗi tuyến.</p>
        </div>
        <button 
          onClick={() => { setEditingRoute(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} />
          Thêm tuyến đường
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tỉnh thành, tên nhà ga..." 
            className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-xl outline-none focus:border-blue-400 bg-gray-50/50 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-400 font-medium whitespace-nowrap">
          Hiển thị <b>{filteredRoutes.length}</b> tuyến đường
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-bold">Đang tải dữ liệu tuyến đường...</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-32 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center">
            <RouteIcon size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Không tìm thấy tuyến đường</h3>
            <p className="text-gray-400 max-w-xs mt-1">Hãy thử thay đổi từ khóa tìm kiếm hoặc thêm tuyến đường mới.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[#2474E5] font-bold text-sm hover:underline flex items-center gap-1"
          >
            <Plus size={16} /> Thêm tuyến đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(route)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(route.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Từ</div>
                      <div className="text-lg font-black text-gray-800">{route.departure || route.origin_station?.city}</div>
                      <div className="text-xs font-medium text-gray-500 truncate max-w-[120px]">{route.origin_station?.name}</div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center gap-1 pt-4">
                      <div className="h-[2px] w-full bg-blue-100 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                          <ArrowRight size={14} className="text-blue-500" />
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase">{route.distance}km</div>
                    </div>

                    <div className="text-center text-right">
                      <div className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Đến</div>
                      <div className="text-lg font-black text-gray-800">{route.destination || route.destination_station?.city}</div>
                      <div className="text-xs font-medium text-gray-500 truncate max-w-[120px]">{route.destination_station?.name}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Thời gian đi</div>
                    <div className="text-sm font-bold text-gray-800">{formatDuration(route.duration)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <span className="font-bold">đ</span>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Giá vé cơ bản</div>
                    <div className="text-sm font-black text-[#2474E5]">{formatPrice(route.price || route.base_price)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateEditRouteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRoutes} 
        editData={editingRoute}
      />
    </div>
  );
}
