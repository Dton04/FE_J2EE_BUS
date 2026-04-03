'use client';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { busService, type BusResponse } from '@/services/busService';
import CreateBusModal from '@/components/admin/CreateBusModal';

interface Toast {
  id: number;
  msg: string;
  ok: boolean;
}

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (msg: string, ok: boolean) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, ok }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const fetchBuses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await busService.getAllBuses();
      setBuses(Array.isArray(data) ? data : []);
    } catch {
      showToast('Không tải được danh sách xe.', false);
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

  const handleGenerateSeats = async (bus: BusResponse) => {
    setActionLoading(bus.id);
    try {
      await busService.generateSeats(bus.id);
      showToast(`✓ Đã sinh lại ${bus.total_seats} ghế cho xe ${bus.license_plate}`, true);
      fetchBuses(); // reload để cập nhật số ghế
    } catch {
      showToast('Không thể sinh sơ đồ ghế. Vui lòng thử lại.', false);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all animate-fade-in
              ${t.ok ? 'bg-emerald-600' : 'bg-red-600'}`}
          >
            {t.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Xe Bus</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ghế được tạo tự động khi thêm xe mới.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#2474E5] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-all shadow-sm"
        >
          <Plus size={18} /> Thêm xe bus
        </button>
      </div>

      {/* Search */}
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

      {/* Table */}
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
                <th className="px-6 py-4">Loại xe</th>
                <th className="px-6 py-4">Tổng ghế</th>
                <th className="px-6 py-4">Ghế đã tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => {
                const seatsOk = b.seats_generated != null && b.seats_generated > 0;
                return (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500">{b.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 font-mono">{b.license_plate}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.bus_type || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{b.total_seats}</td>
                    <td className="px-6 py-4">
                      {seatsOk ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} />
                          {b.seats_generated} ghế
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Chưa có ghế
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateSeats(b)}
                          disabled={actionLoading === b.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition disabled:opacity-50"
                          title="Sinh lại sơ đồ ghế"
                        >
                          {actionLoading === b.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RefreshCw size={14} />
                          )}
                          {actionLoading === b.id ? 'Đang sinh...' : 'Sinh lại ghế'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CreateBusModal isOpen={open} onClose={() => setOpen(false)} onSuccess={() => { fetchBuses(); showToast('Xe mới đã được tạo + ghế sinh tự động!', true); }} />
    </div>
  );
}
