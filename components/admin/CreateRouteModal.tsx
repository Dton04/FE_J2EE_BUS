'use client';
import { useState, useEffect } from 'react';
import { X, DollarSign, Loader2 } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { routeService } from '@/services/routeService';
import { busService, type BusResponse } from '@/services/busService';

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

interface RouteItem {
  id: number;
  name?: string;
}

export default function CreateRouteModal({ isOpen, onClose, onSuccess }: CreateRouteModalProps) {
  const [formData, setFormData] = useState<TripFormData>({
    route_id: '',
    bus_id: '',
    departure_time: '',
    price_modifier: 1.0,
  });
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([routeService.getAllRoutes(), busService.getAllBuses()])
        .then(([routeData, busData]) => {
          setRoutes((routeData || []) as RouteItem[]);
          setBuses(busData || []);
        })
        .catch(() => {
          setRoutes([]);
          setBuses([]);
        });
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
      setFormData({ route_id: '', bus_id: '', departure_time: '', price_modifier: 1.0 });
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Có lỗi xảy ra khi tạo chuyến xe';
      setError(message || 'Có lỗi xảy ra khi tạo chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Tạo tuyến đường mới</h2>
          <button onClick={onClose} title="Close Modal" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
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
            <label htmlFor="routeId" className="block text-sm font-medium text-gray-700 mb-1">Lộ trình</label>
            {routes.length > 0 ? (
              <select
                id="routeId"
                title="Select Route"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
                value={formData.route_id}
                onChange={(e) => setFormData({ ...formData, route_id: e.target.value ? Number(e.target.value) : '' })}
              >
                <option value="">-- Chọn lộ trình --</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    [{route.id}] {route.name || `Route ${route.id}`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="routeId"
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
            <label htmlFor="busId" className="block text-sm font-medium text-gray-700 mb-1">Xe</label>
            <select
              id="busId"
              title="Select Bus"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={formData.bus_id}
              onChange={(e) => setFormData({ ...formData, bus_id: e.target.value ? Number(e.target.value) : '' })}
            >
              <option value="">-- Chọn xe --</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  [{bus.id}] {bus.license_plate} • {bus.total_seats} ghế
                </option>
              ))}
            </select>
          </div>

          {/* Departure time */}
          <div className="space-y-1.5">
            <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-1">Giờ khởi hành</label>
            <input
              id="departureTime"
              type="datetime-local"
              title="Departure Time"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            />
          </div>

          {/* Price modifier */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <DollarSign size={15} className="text-purple-500" /> Hệ số giá
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="VD: 1.0 (Giữ nguyên giá)"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={formData.price_modifier}
              onChange={(e) => setFormData({ ...formData, price_modifier: Number(e.target.value) })}
            />
            <p className="text-[11px] text-gray-500 font-medium">Để 1.0 là giữ nguyên giá gốc của tuyến. Nhập 1.3 = tăng 30%.</p>
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
