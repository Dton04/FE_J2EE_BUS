'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Loader2, Play } from 'lucide-react';
import { busService, type BusResponse } from '@/services/busService';
import CreateBusModal from '@/components/admin/CreateBusModal';

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await busService.getAllBuses();
      setBuses(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const filtered = buses.filter((b) =>
    (b.license_plate || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.bus_type || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerateSeats = async (id: number) => {
    setActionLoading(id);
    try {
      await busService.generateSeats(id);
      alert('Đã sinh sơ đồ ghế cho xe.');
    } catch {
      alert('Không thể sinh sơ đồ ghế. Vui lòng thử lại.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Xe Bus</h1>
          <p className="text-sm text-gray-500 mt-1">Thêm xe, xem danh sách, sinh sơ đồ ghế.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus size={18} /> Thêm xe bus
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo biển số, loại xe..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-500 font-medium">Đang tải danh sách xe...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-2">
            <p className="text-gray-500 font-medium text-lg">Chưa có xe nào</p>
            <p className="text-gray-400 text-sm">Hãy thêm xe mới để bắt đầu</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Biển số</th>
                <th className="px-6 py-4">Số ghế</th>
                <th className="px-6 py-4">Loại xe</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-gray-600">{b.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{b.license_plate}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.total_seats}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.bus_type || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleGenerateSeats(b.id)}
                        disabled={actionLoading === b.id}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-50"
                        title="Sinh sơ đồ ghế"
                      >
                        <Play size={16} /> {actionLoading === b.id ? 'Đang sinh...' : 'Sinh ghế'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateBusModal isOpen={open} onClose={() => setOpen(false)} onSuccess={fetchBuses} />
    </div>
  );
}
