'use client';
import { useState, useEffect } from 'react';
import { X, Route, MapPin, Navigation, Clock, DollarSign, Loader2, Save } from 'lucide-react';
import { routeService, RouteResponse, RouteRequest } from '@/services/routeService';
import { stationService, StationResponse } from '@/services/stationService';

interface CreateEditRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: RouteResponse | null;
}

interface FormState {
  departure: string;
  destination: string;
  distance: number;
  duration: number;
  base_price?: number;
  price?: number;
  origin_station_id?: number;
  destination_station_id?: number;
}

export default function CreateEditRouteModal({ isOpen, onClose, onSuccess, editData }: CreateEditRouteModalProps) {
  const [formData, setFormData] = useState<FormState>({
    departure: '',
    destination: '',
    origin_station_id: 0,
    destination_station_id: 0,
    distance: 0,
    duration: 0,
    base_price: 0,
  });
  const [stations, setStations] = useState<StationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStationsLoading(true);
      stationService.getAllStations()
        .then(data => setStations(data || []))
        .catch(err => console.error('Failed to fetch stations', err))
        .finally(() => setStationsLoading(false));
      
      if (editData) {
        setFormData({
          departure: editData.departure || editData.origin_station?.city || '',
          destination: editData.destination || editData.destination_station?.city || '',
          distance: editData.distance,
          duration: editData.duration,
          price: editData.price || editData.base_price || 0,
          base_price: editData.base_price || editData.price || 0,
          origin_station_id: editData.origin_station?.id || 0,
          destination_station_id: editData.destination_station?.id || 0,
        });
      } else {
        setFormData({
          departure: '',
          destination: '',
          distance: 0,
          duration: 0,
          base_price: 0,
          origin_station_id: 0,
          destination_station_id: 0,
        });
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departure || !formData.destination) {
      setError('Vui lòng chọn hoặc nhập điểm đi và điểm đến.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const requestData: RouteRequest = {
        departure: formData.departure,
        destination: formData.destination,
        distance: Number(formData.distance),
        duration: Number(formData.duration),
        origin_station_id: formData.origin_station_id || 0,
        destination_station_id: formData.destination_station_id || 0,
        base_price: formData.base_price || 0,
        price: formData.base_price || 0,
      };

      console.log('Sending full route creation payload:', requestData);

      if (editData) {
        await routeService.updateRoute(editData.id, requestData);
      } else {
        await routeService.createRoute(requestData);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const responseMessage =
        typeof (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      const fallbackMessage = typeof (err as { message?: unknown })?.message === 'string' ? (err as { message?: string }).message : null;
      setError(responseMessage || fallbackMessage || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleStationChange = (type: 'departure' | 'destination', stationId: number) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setFormData({
        ...formData,
        [type]: station.city,
        [`${type === 'departure' ? 'origin' : 'destination'}_station_id`]: station.id
      });
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}p`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Route size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editData ? 'Chỉnh sửa Tuyến đường' : 'Thêm Tuyến đường mới'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Thiết lập thông tin lộ trình và giá vé cơ bản
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin Station */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> Điểm đi
              </label>
              <select
                required
                disabled={stationsLoading}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm text-gray-700 appearance-none bg-white font-medium disabled:bg-gray-50"
                value={stations.find(s => s.city === formData.departure)?.id || 0}
                onChange={(e) => handleStationChange('departure', Number(e.target.value))}
              >
                <option value="0">-- Chọn điểm đi --</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>

            {/* Destination Station */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Navigation size={16} className="text-green-500" /> Điểm đến
              </label>
              <select
                required
                disabled={stationsLoading}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm text-gray-700 appearance-none bg-white font-medium disabled:bg-gray-50"
                value={stations.find(s => s.city === formData.destination)?.id || 0}
                onChange={(e) => handleStationChange('destination', Number(e.target.value))}
              >
                <option value="0">-- Chọn điểm đến --</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Navigation size={16} className="text-orange-500" /> Khoảng cách (km)
              </label>
              <input
                required
                type="number"
                min="1"
                placeholder="VD: 300"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm font-medium"
                value={formData.distance || ''}
                onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock size={16} className="text-purple-500" /> Thời gian đi (phút)
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="VD: 360"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm font-medium pr-16"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                  {formData.duration > 0 ? formatDuration(formData.duration) : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Base Price */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <DollarSign size={16} className="text-amber-500" /> Giá vé cơ bản (VNĐ)
            </label>
            <div className="relative">
              <input
                required
                type="number"
                min="0"
                step="1000"
                placeholder="VD: 250000"
                className="w-full border border-gray-200 rounded-xl px-10 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm font-bold text-blue-600"
                value={formData.base_price || ''}
                onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
              />
              <DollarSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-bold">đ</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2474E5] hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {editData ? <Save size={20} /> : <Route size={20} />}
                  {editData ? 'Cập nhật Tuyến đường' : 'Tạo Tuyến đường'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
