'use client';
import { useState, useEffect } from 'react';
import { X, Bus, Route, Clock, DollarSign, Loader2 } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { routeService } from '@/services/routeService';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TripFormData {
  route_id: number | '';
  bus_id: number | '';
  departure_time: string;
  price_modifier: number;
}

export default function CreateRouteModal({ isOpen, onClose, onSuccess }: CreateRouteModalProps) {
  const [formData, setFormData] = useState<TripFormData>({
    route_id: '',
    bus_id: '',
    departure_time: '',
    price_modifier: 0,
  });
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      routeService.getAllRoutes()
        .then(data => setRoutes(data || []))
        .catch(() => setRoutes([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route_id || !formData.bus_id || !formData.departure_time) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await tripService.createTrip({
        route_id: Number(formData.route_id),
        bus_id: Number(formData.bus_id),
        departure_time: new Date(formData.departure_time).toISOString(),
        price_modifier: formData.price_modifier,
      });
      onSuccess();
      onClose();
      // Reset form
      setFormData({ route_id: '', bus_id: '', departure_time: '', price_modifier: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Route size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Thêm chuyến xe mới</h2>
              <p className="text-xs text-gray-400 mt-0.5">Gọi API POST /admin/trips</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {/* Route ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Route size={15} className="text-blue-500" /> Lộ trình (Route)
            </label>
            {routes.length > 0 ? (
              <select
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm text-gray-700"
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">-- Chọn lộ trình --</option>
                {routes.map((route: any) => (
                  <option key={route.id} value={route.id}>
                    [{route.id}] {route.origin_station?.name || route.origin} → {route.destination_station?.name || route.destination}
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                type="number"
                min="1"
                placeholder="Nhập ID lộ trình (VD: 1)"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value ? Number(e.target.value) : '' })}
              />
            )}
          </div>

          {/* Bus ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Bus size={15} className="text-orange-500" /> Xe buýt (Bus ID)
            </label>
            <input
              required
              type="number"
              min="1"
              placeholder="Nhập ID xe (VD: 1)"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={formData.bus_id}
              onChange={(e) => setFormData({ ...formData, bus_id: e.target.value ? Number(e.target.value) : '' })}
            />
          </div>

          {/* Departure time */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Clock size={15} className="text-green-500" /> Thời gian khởi hành
            </label>
            <input
              required
              type="datetime-local"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm text-gray-700"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            />
          </div>

          {/* Price modifier */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <DollarSign size={15} className="text-purple-500" /> Hệ số giá (price_modifier)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="VD: 1.0 (giá gốc), 1.3 (tăng 30%)"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={formData.price_modifier}
              onChange={(e) => setFormData({ ...formData, price_modifier: Number(e.target.value) })}
            />
            <p className="text-[11px] text-gray-400">0 = mặc định theo tuyến. Nhập 1.3 để tăng giá 30%.</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Đang tạo chuyến...
                </>
              ) : (
                '✅ Tạo chuyến xe'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
