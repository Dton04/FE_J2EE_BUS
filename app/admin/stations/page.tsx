'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, MapPin } from 'lucide-react';
import { stationService, type StationResponse } from '@/services/stationService';
import CreateEditStationModal from '@/components/admin/CreateEditStationModal';

export default function AdminStationsPage() {
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<StationResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    try {
      // Dùng API public để hiển thị cho mọi user; quyền admin chỉ áp dụng cho thao tác ghi
      const data = await stationService.getAllStations();
      setStations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const filtered = useMemo(
    () =>
      stations.filter((s) => {
        const q = search.toLowerCase();
        return (
          (s.name || '').toLowerCase().includes(q) ||
          (s.provinceName || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q)
        );
      }),
    [stations, search]
  );

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá bến xe này? Hành động không thể hoàn tác.')) return;
    setDeletingId(id);
    try {
      await stationService.deleteStation(id);
      await fetchStations();
    } catch {
      alert('Không thể xoá bến xe. Có thể đang được sử dụng trong lộ trình.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bến xe / Điểm đón trả</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo, sửa, xoá các bến xe phục vụ tuyến đường.</p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus size={18} /> Thêm bến xe
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, thành phố, địa chỉ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-500 font-medium">Đang tải bến xe...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <p className="text-gray-500 font-medium text-lg">Chưa có bến xe nào</p>
            <p className="text-gray-400 text-sm">Hãy thêm mới để bắt đầu</p>
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2474E5] flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {s.provinceName} • {s.address}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditTarget(s)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <Edit2 size={16} /> Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={16} /> {deletingId === s.id ? 'Đang xoá...' : 'Xoá'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateEditStationModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={fetchStations}
      />
      <CreateEditStationModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={fetchStations}
        station={editTarget || undefined}
      />
    </div>
  );
}
