'use client';
import { useState, useEffect } from 'react';
import { X, DollarSign, Loader2, Edit2 } from 'lucide-react';
import { tripService } from '@/services/tripService';
import { routeService } from '@/services/routeService';
import { busService, type BusResponse } from '@/services/busService';

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tripId: number | null;
  initialData?: {
    route_id?: number;
    bus_id?: number;
    departure_time?: string;
    actual_price?: number;
  };
}

interface RouteItem {
  id: number;
  name?: string;
  base_price?: number;
}

export default function EditTripModal({ isOpen, onClose, onSuccess, tripId, initialData }: EditTripModalProps) {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [buses, setBuses] = useState<BusResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [routeId, setRouteId] = useState<number | ''>('');
  const [busId, setBusId] = useState<number | ''>('');
  const [departureTime, setDepartureTime] = useState('');
  const [priceModifier, setPriceModifier] = useState(1.0);

  // Tính giá preview realtime
  const selectedRoute = routes.find(r => r.id === Number(routeId));
  const previewPrice = selectedRoute?.base_price
    ? Math.round((selectedRoute.base_price * priceModifier))
    : null;

  useEffect(() => {
    if (isOpen) {
      Promise.all([routeService.getAllRoutes(), busService.getAllBuses()])
        .then(([routeData, busData]) => {
          setRoutes((routeData || []) as RouteItem[]);
          setBuses(busData || []);
        })
        .catch(() => { setRoutes([]); setBuses([]); });

      if (initialData) {
        setRouteId(initialData.route_id || '');
        setBusId(initialData.bus_id || '');
        // Format datetime-local: "2026-03-30T23:30"
        if (initialData.departure_time) {
          const dt = new Date(initialData.departure_time);
          const local = dt.toISOString().slice(0, 16);
          setDepartureTime(local);
        }
        setPriceModifier(1.0);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen || tripId === null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await tripService.updateTrip(tripId, {
        route_id: routeId ? Number(routeId) : undefined,
        bus_id: busId ? Number(busId) : undefined,
        departure_time: departureTime ? new Date(departureTime).toISOString() : undefined,
        price_modifier: priceModifier,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || 'Có lỗi xảy ra khi cập nhật chuyến xe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b bg-blue-50/50">
          <div className="flex items-center gap-2">
            <Edit2 size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Chỉnh sửa Chuyến xe #{tripId}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
              ⚠️ {error}
            </div>
          )}

          {/* Route */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Lộ trình</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={routeId}
              onChange={(e) => setRouteId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Giữ lộ trình hiện tại --</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>[{r.id}] {r.name || `Route ${r.id}`}</option>
              ))}
            </select>
          </div>

          {/* Bus */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Xe</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={busId}
              onChange={(e) => setBusId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">-- Giữ xe hiện tại --</option>
              {buses.map(b => (
                <option key={b.id} value={b.id}>[{b.id}] {b.license_plate} • {b.total_seats} ghế</option>
              ))}
            </select>
          </div>

          {/* Departure time */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Giờ khởi hành</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
            />
          </div>

          {/* Price modifier */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign size={15} className="text-purple-500" /> Hệ số giá
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-400 transition text-sm"
              value={priceModifier}
              onChange={(e) => setPriceModifier(Number(e.target.value))}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">1.0 = giá gốc tuyến &nbsp;|&nbsp; 1.3 = tăng 30%</p>
              {previewPrice !== null && (
                <span className="font-bold text-blue-600">
                  ≈ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(previewPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> Đang cập nhật...</> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
